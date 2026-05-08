// ================= ELEMENT =================
const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("navLinks");
const themeBtn = document.getElementById("themeToggle");
const cursor = document.querySelector(".cursor-glow");
const overlay = document.querySelector(".nav-overlay");
// DETECT DEVICE
const isMobile = window.innerWidth < 768;

// ================= WEB3 LOADER =================
const progressBar = document.querySelector(".loader-progress");
const percentText = document.getElementById("loadPercent");

let progress = 0;

function fakeLoad(){

  let speed = Math.random() * 5 + 2;
  progress += speed;

  if(progress >= 100){
    progress = 100;

    percentText.innerText = "100%";
    progressBar.style.width = "100%";

    setTimeout(()=>{
      const loader = document.querySelector(".loader");
      loader.classList.add("hide");
      loader.style.display = "none"; // 🔥 ini penting
      document.body.classList.remove("loading");
    }, 400);

    return;
  }

  percentText.innerText = "SYNC " + Math.floor(progress) + "%";
  progressBar.style.width = progress + "%";

  setTimeout(fakeLoad, isMobile ? 40 : 60);
}

window.addEventListener("load", ()=>{
  fakeLoad();
});

// ================= MENU TOGGLE (FIXED) =================
if(toggle && nav){
  toggle.addEventListener("click", () => {
    nav.classList.toggle("active");
    toggle.classList.toggle("active");
    document.body.classList.toggle("menu-open");

    if(overlay){
      overlay.classList.toggle("active");
    }

    // 🔥 reset active saat buka menu
    if(nav.classList.contains("active")){
      document.querySelectorAll(".nav-links a")
        .forEach(link => link.classList.remove("active"));
    }
  });

  // klik menu link
  document.querySelectorAll(".nav-links a").forEach(link=>{
    link.addEventListener("click", ()=>{
      nav.classList.remove("active");
      toggle.classList.remove("active");
      document.body.classList.remove("menu-open");

      if(overlay){
        overlay.classList.remove("active");
      }

      // 🔥 update active setelah klik
      setTimeout(activeNav, 150);
    });
  });
}
// ================= OVERLAY =================
if(overlay){
  overlay.addEventListener("click", ()=>{
    nav.classList.remove("active");
    overlay.classList.remove("active");
    toggle.classList.remove("active");
    document.body.classList.remove("menu-open");
  });
}

// ================= ACTIVE NAV (FIX MOBILE) =================
const sections = document.querySelectorAll("section, header");
const links = document.querySelectorAll(".nav-links a");

function activeNav(){
  let current = "";
  const navbar = document.querySelector(".navbar");
  const navHeight = navbar ? navbar.offsetHeight : 80;

  sections.forEach(sec=>{
    const sectionTop = sec.offsetTop;
    const sectionHeight = sec.offsetHeight;

    if(
      window.scrollY >= sectionTop - navHeight &&
      window.scrollY < sectionTop + sectionHeight - navHeight
    ){
      current = sec.id;
    }
  });

  links.forEach(link=>{
    link.classList.remove("active");
    if(link.getAttribute("href") === "#" + current){
      link.classList.add("active");
    }
  });
}

// ================= NAVBAR SCROLL =================
const navbar = document.querySelector(".navbar");
let lastScroll = 0;

window.addEventListener("scroll", ()=>{
let current = window.scrollY;

if(navbar){
if(current > 50){
navbar.classList.add("scrolled");
}else{
navbar.classList.remove("scrolled");
}

if(current > lastScroll && current > 100){  
  navbar.style.transform = "translateY(-100%)";  
}else{  
  navbar.style.transform = "translateY(0)";  
}  

lastScroll = current;

}
});

// ================= NAVBAR OFFSET =================
function updateOffset(){
  const navbar = document.querySelector(".navbar");
  const navHeight = navbar ? navbar.offsetHeight : 80;

  document.querySelectorAll("section").forEach(sec=>{
    sec.style.scrollMarginTop = (navHeight + 10) + "px";
  });
}

updateOffset();
window.addEventListener("resize", updateOffset);

// ============ SMOOTH SCROLL ===============
let scrolling = false;
let scrollTimeout;

window.addEventListener("scroll", () => {
  scrolling = true;

  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    scrolling = false;
  }, 80);
});

// ================= PREMIUM PARTICLES (CRYPTO UI - VISIBLE FIX) =================
function initParticles(){

  const canvas = document.getElementById("particles");
  if(!canvas) return;

  canvas.style.transform = "translateZ(0)";
  canvas.style.willChange = "transform";

  const ctx = canvas.getContext("2d");

  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const isMobile = window.innerWidth < 768;

  const PARTICLE_COUNT = isMobile ? 25 : 85;
  const CONNECT_DIST = isMobile ? 0 : 140;
  const MOUSE_RADIUS = 160;

  let particles = [];

  for(let i=0;i<PARTICLE_COUNT;i++){
    particles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      vx: (Math.random()-0.5)*0.4,
      vy: (Math.random()-0.5)*0.4,
      base: Math.random()*1.8+0.6,
      size: 0,
      pulse: Math.random()*Math.PI*2
    });
  }

  let mouse = {x:null,y:null};

  window.addEventListener("mousemove", e=>{
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function getColor(){
    return document.body.classList.contains("light-mode")
      ? [14,165,233]
      : [56,189,248];
  }

  function animateParticles(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    const [r,g,b] = getColor();

    // ===== PARTICLES =====
    particles.forEach(p=>{

      p.x += p.vx;
      p.y += p.vy;

      if(p.x<0) p.x=canvas.width;
      if(p.x>canvas.width) p.x=0;
      if(p.y<0) p.y=canvas.height;
      if(p.y>canvas.height) p.y=0;

      p.pulse += 0.05;
      p.size = Math.max(0.5, p.base + Math.sin(p.pulse)*0.7);

      // mouse repel
      if(mouse.x !== null){
        let dx = p.x - mouse.x;
        let dy = p.y - mouse.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        if(dist < MOUSE_RADIUS){
          let force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.x += dx * force * 0.03;
          p.y += dy * force * 0.03;
        }
      }

      // 🔥 STRONG NEON GLOW (biar keliatan)
      const radius = Math.max(1, p.size * 6);

      const glow = ctx.createRadialGradient(
        p.x, p.y, 0,
        p.x, p.y, radius
      );

      glow.addColorStop(0, `rgba(${r},${g},${b},1)`);
      glow.addColorStop(0.3, `rgba(${r},${g},${b},0.6)`);
      glow.addColorStop(1, `rgba(${r},${g},${b},0)`);

      ctx.beginPath();
      ctx.fillStyle = glow;
      ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI*2);
      ctx.fill();

      // core dot (lebih terang)
      ctx.beginPath();
      ctx.fillStyle = `rgba(${r},${g},${b},1)`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fill();
    });

    // ===== CONNECTION (VISIBLE) =====
    if(!isMobile){
      for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){

          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let dist = Math.sqrt(dx*dx + dy*dy);

          if(dist < CONNECT_DIST){

            let opacity = 1 - dist / CONNECT_DIST;

            // 🔥 GRADIENT LINE JELAS
            const gradient = ctx.createLinearGradient(
              particles[i].x,
              particles[i].y,
              particles[j].x,
              particles[j].y
            );

            gradient.addColorStop(0, `rgba(${r},${g},${b},${opacity})`);
            gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.2; // 🔥 lebih tebal biar keliatan

            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    requestAnimationFrame(animateParticles);
  }

  animateParticles();
}

initParticles();

// ================= HERO ===================
const element = document.getElementById("typing");

const parts = [
  '<span class="highlight">Web3 Enthusiast</span>',
  " • ",
  '<span class="highlight2">Digital Analyst</span>',
  " • Future-Driven Hospitality"
];

let partIndex = 0;
let charIndex = 0;

function typing(){
  if(partIndex < parts.length){

    // kalau bagian span → langsung tampil
    if(parts[partIndex].includes("<span")){
      element.innerHTML += parts[partIndex];
      partIndex++;
      charIndex = 0;
      setTimeout(typing, 150);
      return;
    }

    // ketik normal
    if(charIndex < parts[partIndex].length){
      element.innerHTML += parts[partIndex].charAt(charIndex);
      charIndex++;
      setTimeout(typing, 60);
    }else{
      partIndex++;
      charIndex = 0;
      setTimeout(typing, 100);
    }
  }
}

typing();

// ================= PARALLAX =================
window.addEventListener("scroll", ()=>{
const scrolled = window.scrollY;
document.body.style.setProperty("--bg-y", `${scrolled * 0.2}px`);
});

// ================= SKILL STAGGER (NEW) =================
const skillCards = document.querySelectorAll(".skill-card");

const skillCardObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){

      skillCards.forEach((card, i)=>{
        setTimeout(()=>{
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        }, i * 150); // delay berurutan
      });

    }
  });
},{ threshold:0.2 });

if(skillCards.length){
  skillCardObserver.observe(skillCards[0]);
}

// ================= REVEAL ANIMATION (FINAL CLEAN) =================
const revealElements = document.querySelectorAll(
  ".reveal, .reveal-left, .reveal-right"
);

const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("active");
    }
  });
},{
  threshold:0.2
});

revealElements.forEach(el=>{
  revealObserver.observe(el);
});

// ================= MAGNETIC BUTTON =================
const magnets = document.querySelectorAll(".btn, .contact-btn, .social-btn");

magnets.forEach(el=>{
el.addEventListener("mousemove", (e)=>{
const rect = el.getBoundingClientRect();
const x = e.clientX - rect.left - rect.width/2;
const y = e.clientY - rect.top - rect.height/2;

el.style.transform = `translate(${x*0.2}px, ${y*0.2}px) scale(1.05)`;

});

el.addEventListener("mouseleave", ()=>{
el.style.transform = "translate(0,0) scale(1)";
});
});

// ================= WA BUTTON =================
const waBtn = document.querySelector(".wa-btn");

if(waBtn){
setInterval(()=>{
waBtn.style.transform = "scale(1.05)";
setTimeout(()=> waBtn.style.transform = "scale(1)", 300);
}, 2000);
}

// ================= DARK MODE =================
if(localStorage.getItem("theme") === "light"){
document.body.classList.add("light-mode");
if(themeBtn){
themeBtn.innerHTML = '<span class="toggle-circle"></span><i class="fas fa-sun"></i>';
}
}

if(themeBtn){
themeBtn.addEventListener("click", ()=>{
document.body.classList.toggle("light-mode");

if(document.body.classList.contains("light-mode")){  
  localStorage.setItem("theme", "light");  
  themeBtn.innerHTML = '<span class="toggle-circle"></span><i class="fas fa-sun"></i>';  
}else{  
  localStorage.setItem("theme", "dark");  
  themeBtn.innerHTML = '<span class="toggle-circle"></span><i class="fas fa-moon"></i>';  
}

});
}

// ================= CURSOR =================
const glow = document.querySelector(".cursor-glow");
const aura = document.querySelector(".cursor-aura");
const trail = document.querySelector(".cursor-trail");

/* 🔥 MOBILE OFF */
if(isMobile){
  glow?.remove();
  aura?.remove();
  trail?.remove();
}

if(!isMobile && glow && aura && trail){

let mouseX = 0, mouseY = 0;
let glowX = 0, glowY = 0;
let auraX = 0, auraY = 0;
let trailX = 0, trailY = 0;

window.addEventListener("mousemove", e=>{
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor(){

  glowX += (mouseX - glowX) * 0.2;
  glowY += (mouseY - glowY) * 0.2;

  auraX += (mouseX - auraX) * 0.08;
  auraY += (mouseY - auraY) * 0.08;

  trailX += (mouseX - trailX) * 0.35;
  trailY += (mouseY - trailY) * 0.35;

  glow.style.left = glowX + "px";
  glow.style.top = glowY + "px";

  aura.style.left = auraX + "px";
  aura.style.top = auraY + "px";

  trail.style.left = trailX + "px";
  trail.style.top = trailY + "px";

  requestAnimationFrame(animateCursor);
}

animateCursor();

/* hover effect */
document.querySelectorAll("a, button, .btn, .contact-btn").forEach(el=>{
  el.addEventListener("mouseenter", ()=>{
    glow.style.transform = "translate(-50%, -50%) scale(1.4)";
    aura.style.transform = "translate(-50%, -50%) scale(1.6)";
  });

  el.addEventListener("mouseleave", ()=>{
    glow.style.transform = "translate(-50%, -50%) scale(1)";
    aura.style.transform = "translate(-50%, -50%) scale(1)";
  });
});

/* click ripple */
window.addEventListener("click", e=>{
  const ripple = document.createElement("div");
  ripple.className = "cursor-click";

  ripple.style.left = e.clientX + "px";
  ripple.style.top = e.clientY + "px";

  document.body.appendChild(ripple);

  setTimeout(()=> ripple.remove(), 600);
});

}

// ================= FOOTER =================
const footer = document.querySelector(".footer");

const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("active");
    }
  });
},{ threshold:0.2 });

if(footer){
  observer.observe(footer);
}

// ================= ESC CLOSE MENU =================
document.addEventListener("keydown", (e)=>{
if(e.key === "Escape"){
  nav.classList.remove("active");
  overlay.classList.remove("active");
  toggle.classList.remove("active");
  document.body.classList.remove("menu-open");
}
});

// ================= LANGUAGE SYSTEM =================

const idBtn = document.getElementById("idBtn");
const enBtn = document.getElementById("enBtn");

// ===== TRANSLATIONS =====
const translations = {

  en: {

    navHome: "Home",
    navAbout: "About Me",
    navExperience: "Experience",
    navSkills: "Skills",
    navContact: "Contact",

    contactBtn: "Contact Me",
    downloadCv: "Download CV",

    aboutTitle: "About Me",

    aboutText: `
      I have professional experience in the hospitality industry as a Housekeeping staff member and restaurant Waiter,
      which has helped me develop strong discipline, attention to detail, and excellent customer service skills.
      I am accustomed to working under high standards, managing time effectively, and collaborating efficiently within a team environment.
      <br><br>
      In addition, I have technical expertise in programming languages such as Python and PHP, along with database management using SQL.
      I am capable of developing and managing web-based systems as well as handling structured and efficient data processing.
    `,

    experienceTitle: "Experience",
    skillsTitle: "Skills",
    contactTitle: "Contact",
    socialTitle: "Social Media",

    footerText:
      "Copyright © 2026–present • Axel Alexius Latukolan. All Rights Reserved",

    footerBuilt:
      "Built with passion ⚡",

    typingParts: [
      "Web3 Enthusiast • ",
      '<span class="highlight">Digital Analyst</span>',
      " • ",
      '<span class="highlight2">Future-Driven Hospitality</span>'
    ]
  },

  id: {

    navHome: "Beranda",
    navAbout: "Tentang Saya",
    navExperience: "Pengalaman",
    navSkills: "Keahlian",
    navContact: "Kontak",

    contactBtn: "Hubungi Saya",
    downloadCv: "Unduh CV",

    aboutTitle: "Tentang Saya",

    aboutText: `
      Saya memiliki pengalaman kerja di bidang perhotelan sebagai Housekeeping dan restoran sebagai Waiter,
      yang membentuk saya menjadi pribadi yang disiplin, teliti, dan memiliki kemampuan pelayanan yang baik.
      Terbiasa bekerja dengan standar tinggi, manajemen waktu yang baik, serta mampu bekerja sama dalam tim.
      <br><br>
      Selain itu, saya memiliki keahlian di bidang teknologi dengan penguasaan bahasa pemrograman Python dan PHP,
      serta pengelolaan database menggunakan SQL.
      Saya mampu membuat dan mengelola sistem berbasis web maupun pengolahan data secara terstruktur dan efisien.
    `,

    experienceTitle: "Pengalaman",
    skillsTitle: "Keahlian",
    contactTitle: "Kontak",
    socialTitle: "Media Sosial",

    footerText:
      "Hak Cipta © 2026–sekarang • Axel Alexius Latukolan. Seluruh Hak Dilindungi",

    footerBuilt:
      "Dibuat dengan passion ⚡",

    typingParts: [
      '<span class="highlight">Web3 Enthusiast</span>',
      " • ",
      '<span class="highlight-green">Digital Analyst</span>',
      " • ",
      '<span class="highlight-white">Future-Driven Hospitality</span>'
    ]
  }

};

// ===== CHANGE LANGUAGE =====
function setLanguage(lang){

  localStorage.setItem("language", lang);

  document.documentElement.lang = lang;

  document.querySelectorAll("[data-id]").forEach(el=>{

    const key = el.getAttribute("data-id");

    if(translations[lang][key]){
      el.innerHTML = translations[lang][key];
    }

  });

  // ===== LANGUAGE ACTIVE BUTTON =====
  idBtn.classList.remove("active");
  enBtn.classList.remove("active");

  if(lang === "id"){
    idBtn.classList.add("active");
  }else{
    enBtn.classList.add("active");
  }

  // ===== LANGUAGE RESET TYPING =====
  if(typeof element !== "undefined"){

    element.innerHTML = "";

    parts.length = 0;

    translations[lang].typingParts.forEach(item=>{
      parts.push(item);
    });

    partIndex = 0;
    charIndex = 0;

    typing();
  }

}

// ===== INIT LANGUAGE =====
const savedLang =
  localStorage.getItem("language") || "id";

setLanguage(savedLang);

// ===== BUTTON CLICK =====
idBtn.addEventListener("click", ()=>{
  setLanguage("id");
});

enBtn.addEventListener("click", ()=>{
  setLanguage("en");
});

// ================= INIT =================
window.addEventListener("scroll", activeNav);
window.addEventListener("load", activeNav);

activeNav();
