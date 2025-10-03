import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const xaiApiKey = process.env.XAI_API_KEY;

if (!xaiApiKey) {
  console.warn('Warning: XAI_API_KEY is not set. Set it in a .env file.');
}

app.use(express.json());
app.use(cors());
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Serve static files (index.html, styles.css, app.js)
app.use(express.static(__dirname));

app.post('/api/score', async (req, res) => {
  try {
    const { username } = req.body || {};
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'username is required' });
    }
    if (!xaiApiKey) {
      return res.status(500).json({ error: 'Server missing XAI_API_KEY. Set it in .env and restart.' });
    }

    const prompt = `based on tweet from ${username}, can you estimate (from 0 as in dislike to 10 being the biggest supporter) how likely that account being a supporter of current Indonesian government?`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${xaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: 'Upstream error',
        status: response.status,
        statusText: response.statusText,
        details: text
      });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';

    const match = content.match(/\b(10|[0-9])\b/);
    const score = match ? Math.max(0, Math.min(10, Number(match[1]))) : null;

    return res.json({
      score,
      explanation: content,
      raw: data
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`BuzzeRp Meter server running at http://localhost:${port}`);
});


