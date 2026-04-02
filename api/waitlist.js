export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var email = req.body && req.body.email;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  var SUPABASE_URL = process.env.SUPABASE_URL || 'https://qsybqnlhnsswlrlollhh.supabase.co';
  var SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

  try {
    var response = await fetch(SUPABASE_URL + '/rest/v1/waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ email: email })
    });

    if (response.status === 409 || response.status === 201 || response.ok) {
      return res.status(200).json({ ok: true });
    }

    var text = await response.text();
    if (text.includes('duplicate') || text.includes('unique')) {
      return res.status(200).json({ ok: true });
    }

    return res.status(500).json({ error: 'Failed to save' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
