const GIST_ID = 'bc608dc1d2011bc3d3da9c01b344025d';

async function getDb() {
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' }
    });
    const data = await res.json();
    const content = data.files?.['db.json']?.content;
    if (content) return JSON.parse(content);
  } catch (e) {
    console.error('Read gist error:', e);
  }
  return { nextId: 4, articles: {} };
}

export default async function handler(req, res) {
  const urlPath = req.url || '';
  const match = urlPath.match(/\/api\/articles\/(\d+)/);
  const docId = match ? Number(match[1]) : NaN;
  
  if (!Number.isInteger(docId) || docId < 1) {
    return res.status(400).json({ error: 'Invalid docId', url: urlPath });
  }
  
  const db = await getDb();
  const article = db.articles[docId];
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  const { file_path: _fp, ...safe } = article;
  res.json({ ...safe, has_file: false, file_name: null });
}