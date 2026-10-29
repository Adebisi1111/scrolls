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

async function saveDb(db) {
  try {
    await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github+json' },
      body: JSON.stringify({ files: { 'db.json': { content: JSON.stringify(db) } } })
    });
  } catch (e) {
    console.error('Save gist error:', e);
  }
}

export default async function handler(req, res) {
  const db = await getDb();
  
  if (req.method === 'GET') {
    const rows = Object.values(db.articles).map(({ body: _b, file_path: _fp, ...rest }) => rest);
    res.json(rows);
    return;
  }
  
  if (req.method === 'POST') {
    let fields = req.body;
    if (typeof req.body === 'string' && req.headers['content-type']?.includes('multipart/form-data')) {
      fields = {};
      const regex = /name="([^"]+)"\r\n\r\n([^\r\n]*)/g;
      let match;
      while ((match = regex.exec(req.body)) !== null) {
        fields[match[1]] = match[2].trim();
      }
    }
    
    const { title, author_name, author_wallet, abstract, body: articleBody, doc_id: rawDocId } = fields || {};
    
    if (!title || !author_name || !author_wallet || !abstract) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const doc_id = rawDocId ? Number(rawDocId) : db.nextId++;
    if (!Number.isInteger(doc_id) || doc_id < 1) {
      return res.status(400).json({ error: 'Invalid doc_id' });
    }
    
    const article = {
      doc_id, title, author_name, author_wallet, abstract, body: (articleBody || '').trim(),
      file_path: null, file_name: null, file_mime: null, created_at: new Date().toISOString()
    };
    
    db.articles[doc_id] = article;
    if (doc_id >= db.nextId) db.nextId = doc_id + 1;
    
    await saveDb(db);
    
    const { file_path: _fp, ...safe } = article;
    res.status(201).json(safe);
    return;
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}