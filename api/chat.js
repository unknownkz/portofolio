const SYSTEM_PROMPT=`Kamu adalah HEXA, asisten AI pribadi milik Axel Alexius Latukolan.

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

- Tempat & Tanggal Lahir:
  Kota Tangerang, Rabu 15 Desember 1999

- Hobby:
  Bermain Game,
  Code Enthusiast

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
- Gunakan bullet point jika membantu`;

const MODELS=[
'google/gemini-3.5-flash',
'deepseek/deepseek-chat-v4-flash',
'nvidia/nemotron-3-Nano-Omni-30B-A3B'
];

const RATE_LIMIT=15;
const RATE_WINDOW=6e4;
const rateLimitMap=new Map;

function isRateLimited(ip){
const now=Date.now();
const data=rateLimitMap.get(ip)??{count:0,start:now};

if(now-data.start>RATE_WINDOW){
rateLimitMap.set(ip,{count:1,start:now});
return false;
}

if(data.count>=RATE_LIMIT)return true;

data.count++;
rateLimitMap.set(ip,data);

return false;
}

function sendError(res,id,en,status=500){
return res.status(status).json({
success:false,
error:{id,en}
});
}

function buildMessages(history,message){
return[
{role:'system',content:SYSTEM_PROMPT},
...history.slice(-10).map(i=>({
role:i.role==='user'?'user':'assistant',
content:String(i.content).slice(0,1000)
})),
{role:'user',content:message}
];
}

async function requestOpenRouter({model,apiKey,messages}){
const response=await fetch(
'https://openrouter.ai/api/v1/chat/completions',
{
method:'POST',
headers:{
Authorization:`Bearer ${apiKey}`,
'Content-Type':'application/json',
'HTTP-Referer':'https://www.axelal.my.id',
'X-Title':'HEXA AI Assistant'
},
body:JSON.stringify({
model,
messages,
temperature:.7,
max_tokens:500
})
}
);

const data=await response.json();

return{
ok:response.ok,
status:response.status,
data
};
}

export default async function handler(req,res){

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

if(req.method==='OPTIONS')
return res.status(204).end();

if(req.method!=='POST')
return sendError(
res,
'Metode tidak diizinkan.',
'Method not allowed.',
405
);

const ip=
req.headers['x-forwarded-for']||
req.socket?.remoteAddress||
'unknown';

if(isRateLimited(ip))
return sendError(
res,
'Terlalu banyak permintaan.',
'Too many requests.',
429
);

const{
message,
history=[]
}=req.body||{};

if(
!message||
typeof message!=='string'||
!message.trim()
){
return sendError(
res,
'Pesan wajib diisi.',
'Message is required.',
400
);
}

const apiKey=process.env.OPENROUTER_API_KEY;

if(!apiKey){

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

const safeMessage=
message
.trim()
.slice(0,1000);

const messages=
buildMessages(
history,
safeMessage
);

try{

let lastError=null;

for(const model of MODELS){

try{

console.log('==============================');
console.log('HEXA AI REQUEST');
console.log('MODEL:',model);
console.log('IP:',ip);
console.log('MESSAGE:',safeMessage);
console.log('==============================');

const result=
await requestOpenRouter({
model,
apiKey,
messages
});

if(!result.ok){

console.error('==============================');
console.error('MODEL FAILED');
console.error('MODEL:',model);
console.error(
JSON.stringify(result.data)
);
console.error('==============================');

lastError=result.data;

continue;
}

const reply=
result?.data
?.choices?.[0]
?.message?.content
?.trim();

if(!reply){

console.error(
'EMPTY RESPONSE:',
model
);

continue;
}

console.log('==============================');
console.log('SUCCESS MODEL:',model);
console.log('==============================');

return res.status(200).json({
success:true,
model,
reply
});

}catch(modelError){

console.error('==============================');
console.error('MODEL CRASH');
console.error('MODEL:',model);
console.error(modelError);
console.error('==============================');

lastError=modelError;
}
}

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

}catch(error){

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
