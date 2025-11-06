export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
      return;
    }

    const { prompt, model } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Invalid prompt' });
      return;
    }
    const modelName = typeof model === 'string' && model.length > 0 ? model : 'gemini-2.5-flash';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${apiKey}`;
    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      res.status(resp.status).json({ error: 'Gemini request failed', details: text });
      return;
    }

    const data = await resp.json();
    // Attempt to extract text from candidates
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text)?.filter(Boolean)?.join('\n') || '';
    res.status(200).json({ text });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', details: err?.message || String(err) });
  }
}
