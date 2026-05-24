/* ==========================================================================
   HEXA AI Assistant — Axel Alexius Latukolan
   File: /api/chat.js
   Runtime: Node.js (Recommended for Gemini + ENV stability)
   ========================================================================== */


/* ==========================================================================
   SYSTEM PROMPT
   ========================================================================== */
const SYSTEM_PROMPT = `
Kamu adalah HEXA, asisten AI pribadi milik Axel Alexius Latukolan.

TUGAS:
- Membantu pengunjung website portfolio Axel
- Jawab ramah, profesional, singkat, modern
- Gunakan bahasa yang sama dengan user (Indonesia / English)

INFORMASI AXEL:
- Nama: Axel Alexius Latukolan
- Profesi:
  Web3 Analyst, Data Processing Specialist, Hospitality Professional

- Keahlian:
  Python, PHP, SQL, Excel, Web Development

- Pengalaman:
  • PT. Mayora Indah Tbk / Jayanti 3
    Operator Packing (2026–Sekarang)

  • Freelance
    Airdrop Researcher & Web3 Analyst (2022–2025)

  • Dapur Ema
    Waiter (2020–2021)

  • Swissôtel Jakarta PIK Avenue
    Housekeeping (2018–2019)

- Kontak:
  Email: axelalexiusl@gmail.com
  Phone: +62 815-1701-8046

- Social:
  Github: github.com/unknownkz
  Instagram: instagram.com/xelyours
  Website: axelal.my.id

ATURAN:
- Jangan mengarang informasi
- Jawaban maksimal ringkas dan jelas
- Untuk pertanyaan umum → tetap helpful
`;


/* ==========================================================================
   RATE LIMIT
   ========================================================================== */
const rateLimitMap = new Map();

const RATE_LIMIT  = 20;
const RATE_WINDOW = 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();

  const data = rateLimitMap.get(ip) ?? {
    count: 0,
    start: now
  };

  if (now - data.start > RATE_WINDOW) {
    rateLimitMap.set(ip, {
      count: 1,
      start: now
    });

    return false;
  }

  if (data.count >= RATE_LIMIT) {
    return true;
  }

  data.count++;

  rateLimitMap.set(ip, data);

  return false;
}


/* ==========================================================================
   BILINGUAL ERROR HELPER
   ========================================================================== */
function errorResponse(idMessage, enMessage, status = 500) {
  return new Response(
    JSON.stringify({
      error: {
        id: idMessage,
        en: enMessage
      }
    }),
    {
      status,
      headers: {
        ...CORS,
        'Content-Type': 'application/json'
      }
    }
  );
}


/* ==========================================================================
   CORS
   ========================================================================== */
const CORS = {
  'Access-Control-Allow-Origin': 'https://www.axelal.my.id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};


/* ==========================================================================
   MAIN HANDLER
   ========================================================================== */
export default async function handler(req) {

  /* -----------------------------------------------------------------------
     PREFLIGHT
     ----------------------------------------------------------------------- */
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS
    });
  }


  /* -----------------------------------------------------------------------
     METHOD VALIDATION
     ----------------------------------------------------------------------- */
  if (req.method !== 'POST') {
    return errorResponse(
      'Metode tidak diizinkan.',
      'Method not allowed.',
      405
    );
  }


  /* -----------------------------------------------------------------------
     RATE LIMIT
     ----------------------------------------------------------------------- */
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

  if (isRateLimited(ip)) {
    return errorResponse(
      'Terlalu banyak permintaan. Silakan tunggu sebentar.',
      'Too many requests. Please wait a moment.',
      429
    );
  }


  /* -----------------------------------------------------------------------
     PARSE BODY
     ----------------------------------------------------------------------- */
  let body;

  try {
    body = await req.json();
  } catch {
    return errorResponse(
      'Format request tidak valid.',
      'Invalid request body.',
      400
    );
  }


  /* -----------------------------------------------------------------------
     MESSAGE VALIDATION
     ----------------------------------------------------------------------- */
  const { message, history = [] } = body;

  if (
    !message ||
    typeof message !== 'string' ||
    message.trim().length === 0
  ) {
    return errorResponse(
      'Pesan wajib diisi.',
      'Message is required.',
      400
    );
  }


  /* -----------------------------------------------------------------------
     GEMINI API KEY
     ----------------------------------------------------------------------- */
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return errorResponse(
      'API key Gemini tidak ditemukan.',
      'Gemini API key is missing.',
      500
    );
  }


  /* -----------------------------------------------------------------------
     SANITIZE MESSAGE
     ----------------------------------------------------------------------- */
  const safeMessage = message
    .trim()
    .slice(0, 500);


  /* -----------------------------------------------------------------------
     BUILD HISTORY
     ----------------------------------------------------------------------- */
  const contents = [

    {
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT }]
    },

    {
      role: 'model',
      parts: [{
        text: 'Halo! Saya HEXA, asisten AI Axel. Saya siap membantu.'
      }]
    },

    ...history.slice(-10).map(h => ({
      role: h.role === 'user'
        ? 'user'
        : 'model',

      parts: [{
        text: String(h.content).slice(0, 500)
      }]
    })),

    {
      role: 'user',
      parts: [{
        text: safeMessage
      }]
    }
  ];


  /* -----------------------------------------------------------------------
     GEMINI REQUEST
     ----------------------------------------------------------------------- */
  try {

    const model = 'gemini-2.0-flash';

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;


    const geminiRes = await fetch(url, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({

        contents,

        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 512
        },

        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    });


    /* ---------------------------------------------------------------------
       GEMINI ERROR
       --------------------------------------------------------------------- */
    if (!geminiRes.ok) {

      const errText = await geminiRes.text();

      console.error(
        'Gemini API Error:',
        geminiRes.status,
        errText
      );

      return errorResponse(
        'Layanan AI sedang tidak tersedia.',
        'AI service is temporarily unavailable.',
        502
      );
    }


    /* ---------------------------------------------------------------------
       PARSE GEMINI RESPONSE
       --------------------------------------------------------------------- */
    const data = await geminiRes.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';


    if (!reply) {
      return errorResponse(
        'AI tidak memberikan respons.',
        'No response from AI.',
        502
      );
    }


    /* ---------------------------------------------------------------------
       SUCCESS
       --------------------------------------------------------------------- */
    return new Response(
      JSON.stringify({
        reply
      }),
      {
        status: 200,

        headers: {
          ...CORS,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (err) {

    console.error(
      'Internal Server Error:',
      err
    );

    return errorResponse(
      'Terjadi kesalahan pada server.',
      'Internal server error.',
      500
    );
  }
}
