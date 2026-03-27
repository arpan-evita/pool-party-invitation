import { createClient } from 'redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Create client using REDIS_URL provided by Vercel Marketplace
  const client = createClient({
    url: process.env.REDIS_URL
  });

  try {
    const data = req.body;
    const { phone, type } = data;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    await client.connect();
    const key = `lead:${phone}`;

    if (type === 'payment_confirmation') {
      const existingStr = await client.get(key);
      if (existingStr) {
        const existing = JSON.parse(existingStr);
        existing.transaction = data.transaction;
        existing.lastUpdated = new Date().toISOString();
        await client.set(key, JSON.stringify(existing));
      }
    } else {
      data.createdAt = new Date().toISOString();
      await client.set(key, JSON.stringify(data));
      await client.sAdd('all_leads', key);
    }

    await client.quit();
    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('Redis Error:', error.message);
    if (client.isOpen) await client.quit();
    return res.status(500).json({ error: 'Database connection failed. Ensure REDIS_URL is active.' });
  }
}
