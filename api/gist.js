const GIST_ID = 'bc608dc1d2011bc3d3da9c01b344025d';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

async function getDb() {
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' }
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
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github+json' },
      body: JSON.stringify({ files: { 'db.json': { content: JSON.stringify(db) } } })
    });
  } catch (e) {
    console.error('Save gist error:', e);
  }
}

export { getDb, saveDb };