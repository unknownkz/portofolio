/* ==========================================================================
   HEXA AI Assistant — OpenRouter Production Backend
   File: /api/chat.js
   Runtime: Node.js (Vercel Serverless)
   Version: Production Stable v2
   ========================================================================== */


/* ==========================================================================
   SYSTEM PROMPT
   ========================================================================== */
const SYSTEM_PROMPT = `
Kamu adalah HEXA, asisten AI pribadi milik Axel Alexius Latukolan.

TUGAS:
- Membantu pengunjung website portfolio Axel
- Jawab profesional, modern, singkat, helpful
- Gunakan bahasa yang sama dengan user
- Jangan mengarang informasi

INFORMASI AXEL:
- Nama:
  Axel Alexius Latukolan

- Profesi:
  Web3 Analyst,
  Data Processing Specialist,
  Hospitality Professional

- Skills:
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

- Social:
  Github:
  github.com/unknownkz

  Instagram:
  instagram.com/xelyours

  Website:
  axelal.my.id
`;


/* ==========================================================================
   OPENROUTER MODELS (Fallback System)
   ========================================================================== */
const MODELS = [

  // DeepSeek (best free)
  'deepseek/deepseek-r1-0528:free',

  // Gemma
  'google/gemma-2-9b-it:free',

  // Mistral
  'mistralai/mistral-7b-instruct:free'
];


/* ==========================================================================
   RATE LIMIT
   ========================================================================== */
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000;

const rateLimitMap = new Map();

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
   SEND ERROR
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
      'Terlalu banyak permintaan.',
      'Too many requests.',
      429
    );
  }


  /* -----------------------------------------------------------------------
     BODY
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
    typeof message !== 'string'
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

    console.error('OPENROUTER_API_KEY missing');

    return sendError(
      res,
      'API key tidak ditemukan.',
      'API key missing.',
      500
    );
  }


  /* -----------------------------------------------------------------------
     SANITIZE MESSAGE
     ----------------------------------------------------------------------- */
  const safeMessage =
    message
      .trim()
      .slice(0, 1000);


  /* -----------------------------------------------------------------------
     BUILD CHAT HISTORY
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
          item.role === 'user'
            ? 'user'
            : 'assistant',

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
     TRY MODELS (Fallback System)
     ----------------------------------------------------------------------- */
  try {

    let lastError = null;

    for (const model of MODELS) {

      try {

        console.log('==============================');
        console.log('HEXA AI REQUEST');
        console.log('MODEL:', model);
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

              model,

              messages,

              temperature: 0.7,

              max_tokens: 500
            })
          }
        );


        /* ---------------------------------------------------------------
           MODEL FAILED
           --------------------------------------------------------------- */
        if (!response.ok) {

          const errorText = await response.text();

          console.error('==============================');
          console.error('OPENROUTER MODEL FAILED');
          console.error('MODEL:', model);
          console.error(errorText);
          console.error('==============================');

          lastError = errorText;

          continue;
        }


        /* ---------------------------------------------------------------
           PARSE RESPONSE
           --------------------------------------------------------------- */
        const data = await response.json();

        const reply =
          data?.choices?.[0]?.message?.content
          ?? '';


        /* ---------------------------------------------------------------
           EMPTY RESPONSE
           --------------------------------------------------------------- */
        if (!reply) {

          console.error('EMPTY RESPONSE:', model);

          continue;
        }


        /* ---------------------------------------------------------------
           SUCCESS
           --------------------------------------------------------------- */
        console.log('SUCCESS MODEL:', model);

        return res.status(200).json({

          success: true,

          model,

          reply
        });

      } catch (modelError) {

        console.error('MODEL CRASH:', model);
        console.error(modelError);

        lastError = modelError;

        continue;
      }
    }


    /* -------------------------------------------------------------------
       ALL MODELS FAILED
       ------------------------------------------------------------------- */
    console.error('ALL MODELS FAILED');
    console.error(lastError);

    return sendError(
      res,
      'Semua model AI sedang offline.',
      'All AI models are currently offline.',
      502
    );

  } catch (error) {

    console.error('==============================');
    console.error('SERVER ERROR');
    console.error(error);
    console.error('==============================');

    return sendError(
      res,
      'Server mengalami kesalahan.',
      'Internal server error.',
      500
    );
  }
}
