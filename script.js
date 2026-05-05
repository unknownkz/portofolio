// ================= ELEMENT =================
const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("navLinks");
const themeBtn = document.getElementById("themeToggle");
const cursor = document.querySelector(".cursor-glow");
const overlay = document.querySelector(".nav-overlay");

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

// ================= PARTICLES (SMOOTH VERSION) =================

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d", { alpha: true });
if(canvas){
  canvas.style.transform = "translateZ(0)";
};

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);

// DETECT DEVICE
const isMobile = window.innerWidth < 768;

// 🔥 PARTICLE SETTINGS (DI-OPTIMASI)
const particleCount = isMobile ? 18 : 55;
const maxDistance = isMobile ? 0 : 85; // mobile NO LINE

let particles = [];

// INIT PARTICLES
for(let i = 0; i < particleCount; i++){
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    baseSize: Math.random() * 1.2 + 0.4,
    size: 0,
    pulse: Math.random() * Math.PI * 2,
    speedX: (Math.random() - 0.5) * 0.2,
    speedY: (Math.random() - 0.5) * 0.2
  });
}

// COLOR
function getParticleColor(){
  return document.body.classList.contains("light-mode")
    ? "rgba(14,165,233,0.9)"
    : "rgba(56,189,248,0.7)";
}

// MOUSE INTERACTION (RINGAN)
let mouse = { x: null, y: null };

window.addEventListener("mousemove", e=>{
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// ================= PARTICLES ANIMATE =================
function animateParticles(){
  // 🔥 paksa repaint (anti hilang)
  canvas.style.opacity = "0.99";
  canvas.style.opacity = "1";

  // 🔥 WAJIB di atas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🔥 cuma skip DRAW, bukan skip FRAME
  if(scrolling){
    requestAnimationFrame(animateParticles);
    return;
  }

  // render particles normal...
  particles.forEach(p => {

    p.x += p.speedX;
    p.y += p.speedY;

    if(p.x > canvas.width) p.x = 0;
    if(p.x < 0) p.x = canvas.width;
    if(p.y > canvas.height) p.y = 0;
    if(p.y < 0) p.y = canvas.height;

    p.pulse += 0.025;
    p.size = Math.max(0.4, p.baseSize + Math.sin(p.pulse) * 0.5);

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = getParticleColor();
    ctx.fill();
  });

  requestAnimationFrame(animateParticles);
}

  // ================= PARTICLES CONNECTION (DESKTOP ONLY) =================
  if(!isMobile){

    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.5;

    for(let i = 0; i < particles.length; i++){
      for(let j = i + 1; j < particles.length; j++){

        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let dist = dx * dx + dy * dy;

        if(dist < maxDistance * maxDistance){
// ============ SMOOTH SCROLL FIX ============
let scrolling = false;
let scrollTimeout;

window.addEventListener("scroll", () => {
  scrolling = true;

  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    scrolling = false;
  }, 80);
});

// ================= PARTICLES =================
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d", { alpha: true });

if(canvas){
  canvas.style.transform = "translateZ(0)";
}

// resize
function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

window.addEventListener("resize", resizeCanvas);

// device
const isMobile = window.innerWidth < 768;

// settings
const particleCount = isMobile ? 18 : 55;
const maxDistance = isMobile ? 0 : 85;

let particles = [];

// init
for(let i = 0; i < particleCount; i++){
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    baseSize: Math.random() * 1.2 + 0.4,
    size: 0,
    pulse: Math.random() * Math.PI * 2,
    speedX: (Math.random() - 0.5) * 0.2,
    speedY: (Math.random() - 0.5) * 0.2
  });
}

// color
function getParticleColor(){
  return document.body.classList.contains("light-mode")
    ? "rgba(14,165,233,0.9)"
    : "rgba(56,189,248,0.7)";
}

// animate
function animateParticles(){

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // skip draw saat scroll cepat (ANTI GLITCH)
  if(scrolling){
    requestAnimationFrame(animateParticles);
    return;
  }

  // particles
  particles.forEach(p => {

    p.x += p.speedX;
    p.y += p.speedY;

    if(p.x > canvas.width) p.x = 0;
    if(p.x < 0) p.x = canvas.width;
    if(p.y > canvas.height) p.y = 0;
    if(p.y < 0) p.y = canvas.height;

    p.pulse += 0.025;
    p.size = Math.max(0.4, p.baseSize + Math.sin(p.pulse) * 0.5);

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = getParticleColor();
    ctx.fill();
  });

  // connection (desktop only)
  if(!isMobile){
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.5;

    for(let i = 0; i < particles.length; i++){
      for(let j = i + 1; j < particles.length; j++){

        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let dist = dx * dx + dy * dy;

        if(dist < maxDistance * maxDistance){

          ctx.beginPath();
          ctx.strokeStyle = "rgba(56,189,248,0.2)";
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
  }

  requestAnimationFrame(animateParticles);
}

animateParticles();

// ================= HERO ===================
const element = document.getElementById("typing");

const parts = [
  "Profesional Disiplin dengan Pengalaman ",
  '<span class="highlight">Hospitality</span>',
  " & Analisis ",
  '<span class="highlight2">Web3 Analyst</span>'
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

// ================= INIT =================
window.addEventListener("scroll", activeNav);
window.addEventListener("load", activeNav);

activeNav();
