import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.KV_REST_API_URL || process.env.REDIS_URL || process.env.KV_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.REDIS_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all keys from the 'all_leads' set
    const keys = await kv.smembers('all_leads');
    
    if (!keys || keys.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch all records in parallel
    const leads = await Promise.all(
      keys.map(key => kv.get(key))
    );

    // Remove any nulls and return
    return res.status(200).json(leads.filter(l => l !== null));
  } catch (error) {
    console.error('KV Fetch Error:', error.message);
    return res.status(500).json({ error: 'Database fetch failed' });
  }
}
