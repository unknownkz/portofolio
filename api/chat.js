/* ==========================================================================
   HEXA AI Assistant — OpenRouter Backend
   File: /api/chat.js
   Runtime: Node.js (Vercel Serverless)
   Version: Production Stable v5.x
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
- Jangan terlalu panjang
- Tetap natural dan ramah
- Fokus memberi jawaban yang jelas dan mudah dipahami
- Jika pertanyaan tidak berkaitan dengan Axel, tetap bantu jawab secara umum
- Jangan menjawab informasi pribadi di luar data yang tersedia
- Jangan membuat pengalaman atau skill palsu

INFORMASI AXEL:

- Nama:
  Axel Alexius Latukolan

- Nama Panggilan:
  Axel

- Profesi:
  Web3 Analyst,
  Data Processing Specialist,
  Hospitality Professional

- Tech Stack:
  Python,
  PHP,
  JavaScript,
  CSS,
  SQL,
  Docker,
  Microsoft Office (Excel, Word, etc),
  Web Development,
  Artificial Intelligence Development

- Hospitality & Operational Skills:
  Operator Packing / Packer,
  Waiter,
  Housekeeping,
  Teamwork,
  Communication

- Keahlian Tambahan:
  Automation,
  Web Development,
  Data Processing,
  Web Scraping,
  Database Management,
  API Integration,
  Responsive UI Design

- Pengalaman:
  • PT. Mayora Indah Tbk / Jayanti 3
    Operator Packing / Packer (2026–Sekarang)

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

GAYA JAWABAN:
- Profesional tapi santai
- Tidak kaku
- Tidak terlalu formal
- Hindari jawaban terlalu panjang
- Gunakan formatting rapi jika diperlukan
- Gunakan bullet point jika membantu
`;

/* ==========================================================================
   OPENROUTER MODELS
   ========================================================================== */

/*
  IMPORTANT:
  Model IDs below are based on
  your OpenRouter Workspace screenshot.

  Priority:
  1. Gemini 3.5 Flash
  2. DeepSeek V4 Flash
  3. Nemotron 3 Nano Omni
*/

const MODELS = [

  // Main model
  'google/gemini-3.5-flash',

  // Fallback #1
  'deepseek/deepseek-chat-v4-flash',

  // Fallback #2
  'nvidia/nemotron-3-Nano-Omni-30B-A3B'
];


/* ==========================================================================
   RATE LIMIT CONFIG
   ========================================================================== */
const RATE_LIMIT  = 15;
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

  // Increment count
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
   BUILD CHAT HISTORY
   ========================================================================== */
function buildMessages(history, message) {

  return [

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
      content: message
    }
  ];
}


/* ==========================================================================
   OPENROUTER REQUEST
   ========================================================================== */
async function requestOpenRouter({
  model,
  apiKey,
  messages
}) {

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

  const data = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    data
  };
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
    !message.trim()
  ) {

    return sendError(
      res,
      'Pesan wajib diisi.',
      'Message is required.',
      400
    );
  }


  /* -----------------------------------------------------------------------
     API KEY
     ----------------------------------------------------------------------- */
  const apiKey =
    process.env.OPENROUTER_API_KEY;

  if (!apiKey) {

    console.error(
      'OPENROUTER_API_KEY missing'
    );

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
     BUILD MESSAGES
     ----------------------------------------------------------------------- */
  const messages =
    buildMessages(
      history,
      safeMessage
    );


  /* -----------------------------------------------------------------------
     TRY ALL MODELS
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


        const result =
          await requestOpenRouter({

            model,
            apiKey,
            messages
          });


        /* ---------------------------------------------------------------
           MODEL FAILED
           --------------------------------------------------------------- */
        if (!result.ok) {

          console.error('==============================');
          console.error('MODEL FAILED');
          console.error('MODEL:', model);
          console.error(
            JSON.stringify(result.data)
          );
          console.error('==============================');

          lastError = result.data;

          continue;
        }


        /* ---------------------------------------------------------------
           GET RESPONSE
           --------------------------------------------------------------- */
        const reply =
          result?.data
            ?.choices?.[0]
            ?.message?.content
            ?.trim();


        /* ---------------------------------------------------------------
           EMPTY RESPONSE
           --------------------------------------------------------------- */
        if (!reply) {

          console.error(
            'EMPTY RESPONSE:',
            model
          );

          continue;
        }


        /* ---------------------------------------------------------------
           SUCCESS
           --------------------------------------------------------------- */
        console.log('==============================');
        console.log('SUCCESS MODEL:', model);
        console.log('==============================');

        return res.status(200).json({

          success: true,

          model,

          reply
        });
      }

      catch (modelError) {

        console.error('==============================');
        console.error('MODEL CRASH');
        console.error('MODEL:', model);
        console.error(modelError);
        console.error('==============================');

        lastError = modelError;
      }
    }


    /* -------------------------------------------------------------------
       ALL MODELS FAILED
       ------------------------------------------------------------------- */
    console.error('==============================');
    console.error('ALL MODELS FAILED');
    console.error(lastError);
    console.error('==============================');

    return sendError(
      res,
      'Semua model AI sedang offline.',
      'All AI models are currently offline.',
      502
    );

  }

  catch (error) {

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
