import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    const { phone, type } = data;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const key = `lead:${phone}`;

    if (type === 'payment_confirmation') {
      // Update existing record with transaction ID
      const existing = await kv.get(key);
      if (existing) {
        existing.transaction = data.transaction;
        existing.lastUpdated = new Date().toISOString();
        await kv.set(key, existing);
      }
    } else {
      // Create new record (or overwrite if existing)
      data.createdAt = new Date().toISOString();
      await kv.set(key, data);
      
      // Also add to a tracking set of all lead keys
      await kv.sadd('all_leads', key);
    }

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('KV Error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}
