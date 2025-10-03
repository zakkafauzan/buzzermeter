(() => {
  const input = document.getElementById('accountInput');
  const button = document.querySelector('.measure-button');
  const needle = document.querySelector('.gauge-needle');
  const explanation = document.getElementById('explanation');
  const params = new URLSearchParams(location.search);
  const paramBackend = params.get('backend');
  if (paramBackend) {
    try { localStorage.setItem('backendBase', paramBackend); } catch (_) {}
  }
  let discoveredBase = null;
  try { discoveredBase = localStorage.getItem('backendBase') || null; } catch (_) { discoveredBase = null; }

  // If opened directly from the filesystem, the backend won't be reachable
  if (location.protocol === 'file:') {
    explanation.value = 'This page is opened via file://.\nStart the server and open http://localhost:3000 instead.\n\nSteps:\n1) Create .env with XAI_API_KEY=YOUR_KEY\n2) npm install\n3) npm start\n4) Visit http://localhost:3000';
  }

  function setNeedle(score) {
    const bounded = Math.max(0, Math.min(10, Number(score)));
    const rotation = -90 + (bounded / 10) * 180; // map 0..10 -> -90..90
    needle.style.setProperty('--needle-rotation', `${rotation}deg`);
  }

  async function discoverBase() {
    if (discoveredBase) return discoveredBase;
    const candidates = [];
    if (location.origin && location.origin !== 'null') candidates.push(location.origin);
    const host = (location.hostname && location.hostname !== 'null') ? location.hostname : 'localhost';
    candidates.push(`http://${host}:3000`, `http://${host}:5500`);
    candidates.push('http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500');
    for (const base of candidates) {
      try {
        const r = await fetch(`${base}/health`, { method: 'GET' });
        if (r.ok) {
          discoveredBase = base;
          try { localStorage.setItem('backendBase', base); } catch (_) {}
          return base;
        }
      } catch (_) { /* ignore */ }
    }
    return null;
  }

  async function measure() {
    const username = (input.value || '').trim();
    if (!username) return;

    button.disabled = true;
    button.textContent = 'Measuring…';
    try {
      const base = paramBackend || discoveredBase || await discoverBase();
      if (!base) throw new Error('Backend not reachable: /health failed on all candidates');
      const resp = await fetch(`${base}/api/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const text = await resp.text();
      const data = (() => { try { return JSON.parse(text); } catch { return { error: text }; } })();
      if (!resp.ok) {
        const status = resp.status;
        const statusText = resp.statusText;
        const details = data?.details || data?.error || text || 'Request failed';
        throw new Error(`HTTP ${status} ${statusText}: ${details}`);
      }
      if (typeof data.score === 'number') setNeedle(data.score);
      const explanationText = data.explanation || '(no explanation returned)';
      const rawText = data.raw ? `\n\n--- raw response ---\n${JSON.stringify(data.raw, null, 2)}` : '';
      explanation.value = `${explanationText}${rawText}`;
    } catch (e) {
      console.error(e);
      const hint = (e && e.message && e.message.includes('Failed to fetch'))
        ? `\n\nHint: Ensure the server is running (npm start) and open the app at http://localhost:3000 (not file://). Also check firewall/VPN blocking https://api.x.ai.`
        : '';
      explanation.value = `Failed to fetch score: ${e?.message || e}${hint}`;
    } finally {
      button.disabled = false;
      button.textContent = 'Measure!';
    }
  }

  button.addEventListener('click', measure);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') measure();
  });
})();


