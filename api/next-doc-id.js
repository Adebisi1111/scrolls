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
  
  const CONTRACT = '0x98ad696951e36a256702517600d17f63db76a0d2';
  const RPC_URL = 'https://rpc.mainnet.arc.io';
  
  let candidate = db.nextId || 4;
  while (true) {
    const docHex = candidate.toString(16).padStart(64, '0');
    const data = '0x9e2b8488' + docHex;
    try {
      const rpcRes = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ from: '0x61fd0047595a30a067f1f21f3b28c4ae8a8e3dc3', to: CONTRACT, data }, 'latest'],
          id: 1
        })
      });
      const json = await rpcRes.json();
      if (json.result && json.result !== '0x' && !json.result.endsWith('0000000000000000000000000000000000000000')) {
        candidate++;
        if (candidate > 10000) {
          return res.status(500).json({ error: 'No available doc IDs' });
        }
        continue;
      }
    } catch (e) {
      console.error('getAuthor error:', e);
    }
    break;
  }
  
  db.nextId = candidate + 1;
  await saveDb(db);
  
  res.json({ doc_id: candidate });
}