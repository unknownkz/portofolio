// ================= ELEMENT =================
const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("navLinks");
const themeBtn = document.getElementById("themeToggle");
const cursor = document.querySelector(".cursor-glow");
const overlay = document.querySelector(".nav-overlay");

// ================= MENU TOGGLE =================
if(toggle && nav){
  toggle.addEventListener("click", () => {
    nav.classList.toggle("active");
    toggle.classList.toggle("active");
    document.body.classList.toggle("menu-open");

    // overlay ikut toggle kalau ada
    if(overlay){
      overlay.classList.toggle("active");
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

// ================= ACTIVE NAV =================
const sections = document.querySelectorAll("section, header");
const links = document.querySelectorAll(".nav-links a");

function activeNav(){
let current = "";

sections.forEach(sec=>{
if(window.scrollY >= sec.offsetTop - 120){
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

// ================= PARTICLES ==============
function getParticleColor(){
  return document.body.classList.contains("light-mode")
    ? "rgba(14,165,233,0.5)"
    : "rgba(56,189,248,0.7)";
}

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);

let particles = [];

/* jumlah particle (mobile friendly) */
const particleCount = window.innerWidth < 768 ? 40 : 80;

/* buat particle */
for(let i=0; i<particleCount; i++){
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 0.5,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: (Math.random() - 0.5) * 0.3
  });
}

/* animasi */
function animateParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  particles.forEach(p => {
    p.x += p.speedX;
    p.y += p.speedY;

    /* looping biar tidak hilang */
    if(p.x > canvas.width) p.x = 0;
    if(p.x < 0) p.x = canvas.width;
    if(p.y > canvas.height) p.y = 0;
    if(p.y < 0) p.y = canvas.height;

    /* gambar bintang */
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);

    ctx.fillStyle = getParticleColor();
    ctx.shadowBlur = 10;
    ctx.shadowColor = getParticleColor();

    ctx.fill();
  });
  for(let i=0;i<particles.length;i++){
    for(let j=i;j<particles.length;j++){
      let dx = particles[i].x - particles[j].x;
      let dy = particles[i].y - particles[j].y;
      let dist = Math.sqrt(dx*dx + dy*dy);

      if(dist < 100){
        ctx.beginPath();
        ctx.strokeStyle = "rgba(56,189,248,0.08)";
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
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

// ================= SKILL ANIMATION =================
const skillBars = document.querySelectorAll(".bar span");

const skillObserver = new IntersectionObserver(entries=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
const bar = entry.target;
bar.style.width = bar.dataset.width;
}
});
},{ threshold:0.3 });

skillBars.forEach(bar=>{
bar.dataset.width = bar.style.width;
bar.style.width = "0";
skillObserver.observe(bar);
});

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
if(cursor){
let mouseX=0, mouseY=0, currentX=0, currentY=0;

window.addEventListener("mousemove", e=>{
mouseX = e.clientX;
mouseY = e.clientY;
});

function animateCursor(){
currentX += (mouseX-currentX)*0.15;
currentY += (mouseY-currentY)*0.15;

cursor.style.left = currentX+"px";  
cursor.style.top = currentY+"px";  

requestAnimationFrame(animate);

}

animateCursor();

document.querySelectorAll("a, button, .btn, .contact-btn").forEach(el=>{
el.addEventListener("mouseenter", ()=>cursor.classList.add("active"));
el.addEventListener("mouseleave", ()=>cursor.classList.remove("active"));
});
}

// ================= PERFORMANCE =================
if(window.innerWidth < 768){
document.querySelectorAll(".cursor-glow").forEach(el=>el.remove());
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
activeNav();
