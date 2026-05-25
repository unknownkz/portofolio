/* ==========================================================================
   HEXA AI Assistant — OpenRouter Backend
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
- Jawab profesional, modern, singkat, jelas, helpful
- Gunakan bahasa yang sama dengan user
- Jangan mengarang informasi
- Jawaban jangan terlalu panjang

INFORMASI AXEL:

Nama:
Axel Alexius Latukolan

Profesi:
- Web3 Analyst
- Data Processing Specialist
- Hospitality Professional

Keahlian:
- Python
- PHP
- SQL
- Excel
- Web Development

Pengalaman:
- PT. Mayora Indah Tbk / Jayanti 3
  Operator Packing (2026–Sekarang)

- Freelance
  Airdrop Researcher & Web3 Analyst (2022–2025)

- Dapur Ema
  Waiter (2020–2021)

- Swissôtel Jakarta PIK Avenue
  Housekeeping (2018–2019)

Kontak:
- Email:
  axelalexiusl@gmail.com

- Phone:
  +62 815-1701-8046

Social Media:
- Github:
  github.com/unknownkz

- Instagram:
  instagram.com/xelyours

Website:
axelal.my.id
`;


/* ==========================================================================
   MODEL CONFIG
   ========================================================================== */
const MODEL = 'deepseek/deepseek-chat-v3-0324:free';


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

  // Limit reached
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
   MAIN HANDLER
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
      'Terlalu banyak permintaan. Tunggu sebentar.',
      'Too many requests. Please wait a moment.',
      429
    );
  }


  /* -----------------------------------------------------------------------
     REQUEST BODY
     ----------------------------------------------------------------------- */
  const {
    message,
    history = []
  } = req.body || {};


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
     OPENROUTER API KEY
     ----------------------------------------------------------------------- */
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {

    console.error('OPENROUTER_API_KEY not found');

    return sendError(
      res,
      'API key OpenRouter tidak ditemukan.',
      'OpenRouter API key is missing.',
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
     BUILD OPENROUTER MESSAGES
     ----------------------------------------------------------------------- */
  const messages = [

    {
      role: 'system',
      content: SYSTEM_PROMPT
    },

    ...history
      .slice(-10)
      .map(item => ({

        role:
          item.role === 'assistant'
            ? 'assistant'
            : 'user',

        content:
          String(item.content)
            .slice(0, 1000)
      })),

    {
      role: 'user',
      content: safeMessage
    }
  ];


  /* -----------------------------------------------------------------------
     OPENROUTER REQUEST
     ----------------------------------------------------------------------- */
  try {

    console.log('==============================');
    console.log('HEXA AI REQUEST');
    console.log('MODEL:', MODEL);
    console.log('IP:', ip);
    console.log('MESSAGE:', safeMessage);
    console.log('==============================');

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {

        method: 'POST',

        headers: {

          'Authorization':
            `Bearer ${apiKey}`,

          'Content-Type':
            'application/json',

          'HTTP-Referer':
            'https://www.axelal.my.id',

          'X-Title':
            'HEXA AI Assistant'
        },

        body: JSON.stringify({

          model: MODEL,

          messages,

          temperature: 0.7,

          max_tokens: 500
        })
      }
    );


    /* ---------------------------------------------------------------------
       RAW RESPONSE
       --------------------------------------------------------------------- */
    const rawText = await response.text();

    console.log('OPENROUTER RAW RESPONSE:');
    console.log(rawText);


    /* ---------------------------------------------------------------------
       ERROR RESPONSE
       --------------------------------------------------------------------- */
    if (!response.ok) {

      return sendError(
        res,
        'Layanan AI sedang bermasalah.',
        'AI service is temporarily unavailable.',
        502
      );
    }


    /* ---------------------------------------------------------------------
       PARSE JSON
       --------------------------------------------------------------------- */
    let data;

    try {

      data = JSON.parse(rawText);

    } catch {

      return sendError(
        res,
        'Respons AI tidak valid.',
        'Invalid AI response.',
        502
      );
    }


    /* ---------------------------------------------------------------------
       EXTRACT REPLY
       --------------------------------------------------------------------- */
    const reply =
      data?.choices?.[0]?.message?.content?.trim()
      ?? '';


    /* ---------------------------------------------------------------------
       EMPTY RESPONSE
       --------------------------------------------------------------------- */
    if (!reply) {

      return sendError(
        res,
        'AI tidak memberikan respons.',
        'AI returned empty response.',
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
    console.error('SERVER ERROR');
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
