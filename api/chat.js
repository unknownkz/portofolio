/* ==========================================================================
   HEXA AI Assistant — Axel Alexius Latukolan
   File: /api/chat.js
   Runtime: Node.js (Vercel Serverless Function)
   Version: Production Stable
   ========================================================================== */


/* ==========================================================================
   SYSTEM PROMPT
   ========================================================================== */
const SYSTEM_PROMPT = `
Kamu adalah HEXA, asisten AI pribadi milik Axel Alexius Latukolan.

TUGAS:
- Membantu pengunjung website portfolio Axel
- Jawab ramah, profesional, modern, singkat, jelas
- Gunakan bahasa yang sama dengan user (Indonesia / English)
- Jangan terlalu panjang
- Jangan mengarang informasi

INFORMASI AXEL:
- Nama:
  Axel Alexius Latukolan

- Profesi:
  Web3 Analyst,
  Data Processing Specialist,
  Hospitality Professional

- Keahlian:
  Python,
  PHP,
  SQL,
  Excel,
  Web Development

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
  Email:
  axelalexiusl@gmail.com

  Phone:
  +62 815-1701-8046

- Social Media:
  Github:
  github.com/unknownkz

  Instagram:
  instagram.com/xelyours

  Website:
  axelal.my.id
`;


/* ==========================================================================
   RATE LIMIT CONFIG
   ========================================================================== */
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000;

const rateLimitMap = new Map();


/* ==========================================================================
   RATE LIMIT HELPER
   ========================================================================== */
function isRateLimited(ip) {

  const now = Date.now();

  const data = rateLimitMap.get(ip) ?? {
    count: 0,
    start: now
  };

  // Reset window
  if (now - data.start > RATE_WINDOW) {

    rateLimitMap.set(ip, {
      count: 1,
      start: now
    });

    return false;
  }

  // Max request reached
  if (data.count >= RATE_LIMIT) {
    return true;
  }

  // Increment
  data.count++;

  rateLimitMap.set(ip, data);

  return false;
}


/* ==========================================================================
   SEND ERROR RESPONSE
   ========================================================================== */
function sendError(
  res,
  idMessage,
  enMessage,
  status = 500
) {

  return res.status(status).json({

    success: false,

    error: {
      id: idMessage,
      en: enMessage
    }
  });
}


/* ==========================================================================
   MAIN API HANDLER
   ========================================================================== */
export default async function handler(req, res) {

  /* -----------------------------------------------------------------------
     CORS
     ----------------------------------------------------------------------- */
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://www.axelal.my.id'
  );

  res.setHeader(
    'Access-Control-Allow-Methods',
    'POST, OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );


  /* -----------------------------------------------------------------------
     PREFLIGHT
     ----------------------------------------------------------------------- */
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }


  /* -----------------------------------------------------------------------
     METHOD VALIDATION
     ----------------------------------------------------------------------- */
  if (req.method !== 'POST') {

    return sendError(
      res,
      'Metode tidak diizinkan.',
      'Method not allowed.',
      405
    );
  }


  /* -----------------------------------------------------------------------
     CLIENT IP
     ----------------------------------------------------------------------- */
  const ip =
    req.headers['x-forwarded-for'] ||
    req.socket?.remoteAddress ||
    'unknown';


  /* -----------------------------------------------------------------------
     RATE LIMIT
     ----------------------------------------------------------------------- */
  if (isRateLimited(ip)) {

    return sendError(
      res,
      'Terlalu banyak permintaan. Silakan tunggu sebentar.',
      'Too many requests. Please wait a moment.',
      429
    );
  }


  /* -----------------------------------------------------------------------
     REQUEST BODY
     ----------------------------------------------------------------------- */
  const body = req.body;

  if (!body) {

    return sendError(
      res,
      'Body request kosong.',
      'Request body is empty.',
      400
    );
  }


  /* -----------------------------------------------------------------------
     EXTRACT DATA
     ----------------------------------------------------------------------- */
  const {
    message,
    history = []
  } = body;


  /* -----------------------------------------------------------------------
     VALIDATE MESSAGE
     ----------------------------------------------------------------------- */
  if (
    !message ||
    typeof message !== 'string' ||
    message.trim().length === 0
  ) {

    return sendError(
      res,
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

    console.error('GEMINI_API_KEY not found');

    return sendError(
      res,
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
    .slice(0, 1000);


  /* -----------------------------------------------------------------------
     BUILD CHAT HISTORY
     ----------------------------------------------------------------------- */
  const contents = [

    // System prompt
    {
      role: 'user',
      parts: [{
        text: SYSTEM_PROMPT
      }]
    },

    // Assistant intro
    {
      role: 'model',
      parts: [{
        text:
          'Halo! Saya HEXA, asisten AI Axel Alexius Latukolan. Saya siap membantu.'
      }]
    },

    // Previous history
    ...history
      .slice(-10)
      .map(item => ({

        role:
          item.role === 'user'
            ? 'user'
            : 'model',

        parts: [{
          text: String(item.content)
            .slice(0, 1000)
        }]
      })),

    // Current message
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

    /*
      MODEL RECOMMENDATION:
      gemini-2.0-flash
      - Fast
      - Stable
      - FREE BILLING FRIENDLY
      - Very suitable for AI assistant
    */
    const model = 'gemini-2.5-flash';


    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;


    console.log('==============================');
    console.log('HEXA AI REQUEST');
    console.log('MODEL:', model);
    console.log('IP:', ip);
    console.log('MESSAGE:', safeMessage);
    console.log('==============================');


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

          topK: 40,

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

      const errorText = await geminiRes.text();

      console.error('==============================');
      console.error('GEMINI API ERROR');
      console.error('STATUS:', geminiRes.status);
      console.error(errorText);
      console.error('==============================');

      return sendError(
        res,
        'Layanan AI sedang bermasalah.',
        'AI service is temporarily unavailable.',
        502
      );
    }


    /* ---------------------------------------------------------------------
       PARSE RESPONSE
       --------------------------------------------------------------------- */
    const data = await geminiRes.json();

    console.log('GEMINI RESPONSE:', JSON.stringify(data));

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text
      ?? '';


    /* ---------------------------------------------------------------------
       EMPTY RESPONSE
       --------------------------------------------------------------------- */
    if (!reply) {

      return sendError(
        res,
        'AI tidak memberikan respons.',
        'AI returned an empty response.',
        502
      );
    }


    /* ---------------------------------------------------------------------
       SUCCESS RESPONSE
       --------------------------------------------------------------------- */
    return res.status(200).json({

      success: true,

      reply
    });

  } catch (error) {

    console.error('==============================');
    console.error('INTERNAL SERVER ERROR');
    console.error(error);
    console.error('==============================');

    return sendError(
      res,
      'Terjadi kesalahan pada server.',
      'Internal server error.',
      500
    );
  }
}
