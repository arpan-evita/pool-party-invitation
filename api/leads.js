import { createClient } from 'redis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = createClient({
    url: process.env.REDIS_URL
  });

  try {
    await client.connect();
    
    // Get all keys from the 'all_leads' set
    const keys = await client.sMembers('all_leads');
    
    if (!keys || keys.length === 0) {
      await client.quit();
      return res.status(200).json([]);
    }

    // Fetch all records in parallel
    const leadsStr = await Promise.all(
      keys.map(key => client.get(key))
    );

    await client.quit();
    
    // Parse JSON strings and remove any nulls
    const leads = leadsStr
      .filter(l => l !== null)
      .map(l => JSON.parse(l));

    return res.status(200).json(leads);

  } catch (error) {
    console.error('Redis Fetch Error:', error.message);
    if (client.isOpen) await client.quit();
    return res.status(500).json({ error: 'Database fetch failed. Ensure REDIS_URL is active.' });
  }
}
