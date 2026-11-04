export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const urls = ['https://rpc.mainnet.arc.io'];
  for (const url of urls) {
    try {
      const upstream = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body) });
      const data = await upstream.json();
      res.status(upstream.status).json(data);
      return;
    } catch (e) {
      console.warn('upstream failed:', url, e);
    }
  }
  res.status(502).json({ error: 'RPC proxy error' });
}