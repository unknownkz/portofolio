/* ==========================================================================
   PORTOFOLIO — Axel Alexius Latukolan
   /api/chat.js  |  Vercel Edge Function
   Proxy ke Gemini API — API key aman di server, tidak terekspos ke browser
   ========================================================================== */

export const config = { runtime: 'edge' };

/* -- System prompt — konteks portofolio Axel ----------------------------- */
const SYSTEM_PROMPT = `Kamu adalah HEXA, asisten AI Web3 pribadi milik Axel Alexius Latukolan.
Kamu membantu pengunjung website portofolio Axel dengan ramah, singkat, dan profesional.

INFORMASI TENTANG AXEL:
- Nama lengkap: Axel Alexius Latukolan
- Profesi: Web3 Analyst, Data Processing Specialist, Hospitality Professional
- Keahlian teknis: Python, PHP, SQL, Excel, Web Development
- Pengalaman:
  * PT. Mayora Indah Tbk / Jayanti 3 — Operator Packing (2026–sekarang)
  * Freelance — Airdrop Researcher & Web3 Analyst (2022–2025)
  * Dapur Ema — Waiter (2020–2021)
  * Swissôtel Jakarta PIK Avenue — Housekeeping (2018–2019)
- Kontak: axelalexiusl@gmail.com | +62 815-1701-8046
- GitHub: github.com/unknownkz
- Instagram: instagram.com/xelyours
- Website: axelal.my.id

PANDUAN MENJAWAB:
- Jawab dalam bahasa yang sama dengan pertanyaan (ID atau EN)
- Untuk pertanyaan tentang Axel → jawab berdasarkan info di atas
- Untuk pertanyaan umum → jawab sebagai AI assistant yang helpful
- Jawaban singkat, jelas, tidak bertele-tele
- Jangan pernah membuat informasi tentang Axel yang tidak ada di atas`;

/* -- Rate limiting sederhana via IP -------------------------------------- */
const rateLimitMap = new Map();
const RATE_LIMIT   = 20;  // max request per IP per menit
const RATE_WINDOW  = 60 * 1000;

function isRateLimited(ip) {
  const now  = Date.now();
  const data = rateLimitMap.get(ip) ?? { count: 0, start: now };

  if (now - data.start > RATE_WINDOW) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }

  if (data.count >= RATE_LIMIT) return true;

  data.count++;
  rateLimitMap.set(ip, data);
  return false;
}

/* -- CORS headers -------------------------------------------------------- */
const CORS = {
  'Access-Control-Allow-Origin':  'https://www.axelal.my.id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/* -- Main handler -------------------------------------------------------- */
export default async function handler(req) {

  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS });
  }

  // Rate limit
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
      { status: 429, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  // Parse body
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body.' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  const { message, history = [] } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: 'Message is required.' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  // Sanitize — max 500 chars per message
  const safeMessage = message.trim().slice(0, 500);

  // Build Gemini conversation history
  const contents = [
    // System prompt as first user turn (Gemini format)
    { role: 'user',  parts: [{ text: SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: 'Siap! Saya HEXA, asisten AI Web3 Axel. Saya siap membantu!' }] },

    // Previous conversation history (max 10 turns)
    ...history.slice(-10).map(h => ({
      role:  h.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(h.content).slice(0, 500) }],
    })),

    // Current message
    { role: 'user', parts: [{ text: safeMessage }] },
  ];

  // Call Gemini API
  try {
    const apiKey  = process.env.GEMINI_API_KEY;
    const model   = 'gemini-1.5-flash';
    const url     = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature:     0.7,
          maxOutputTokens: 512,
          topP:            0.9,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errText);
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable.' }),
        { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    const data  = await geminiRes.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!reply) {
      return new Response(
        JSON.stringify({ error: 'No response from AI.' }),
        { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
}
