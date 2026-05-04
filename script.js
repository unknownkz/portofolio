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
const isMobile = window.innerWidth < 768;

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

// ================= PARTICLES ==============
function getParticleColor(){
  return document.body.classList.contains("light-mode")
    ? "rgba(14,165,233,0.9)"
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

const particleCount = window.innerWidth < 768 ? 35 : 70;

for(let i=0; i<particleCount; i++){
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    baseSize: Math.random() * 1.5 + 0.5,
    size: 0,
    pulse: Math.random() * Math.PI * 2,
    speedX: (Math.random() - 0.5) * 0.25,
    speedY: (Math.random() - 0.5) * 0.25
  });
}

// ================= MOUSE INTERACTION =================
let mouse = { x:null, y:null };

window.addEventListener("mousemove", e=>{
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

/* animasi */
function animateParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  particles.forEach(p => {

    // 🔥 tarik particle ke mouse (halus)
    if(mouse.x !== null && mouse.y !== null){
      let dx = p.x - mouse.x;
      let dy = p.y - mouse.y;
      let dist = Math.sqrt(dx*dx + dy*dy);

      if(dist < 120){
        p.x += dx * 0.015;
        p.y += dy * 0.015;
      }
    }

    // gerak
    p.x += p.speedX;
    p.y += p.speedY;

    // loop
    if(p.x > canvas.width) p.x = 0;
    if(p.x < 0) p.x = canvas.width;
    if(p.y > canvas.height) p.y = 0;
    if(p.y < 0) p.y = canvas.height;

    // pulse (🔥 ini bikin hidup)
    p.pulse += 0.03;
    p.size = Math.max(0.5, p.baseSize + Math.sin(p.pulse) * 0.8);
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);

    ctx.fillStyle = getParticleColor();
    ctx.shadowBlur = 15;
    ctx.shadowColor = getParticleColor();

    ctx.fill();
  });

for(let i=0;i<particles.length;i++){
  for(let j=i;j<particles.length;j++){

    let dx = particles[i].x - particles[j].x;
    let dy = particles[i].y - particles[j].y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    if(dist < 110){
      let opacity = 1 - dist / 110;

      ctx.beginPath();

      // 🔥 gradient aktif
      let gradient = ctx.createLinearGradient(
        particles[i].x,
        particles[i].y,
        particles[j].x,
        particles[j].y
      );

      gradient.addColorStop(0, `rgba(56,189,248,${opacity * 0.25})`);
      gradient.addColorStop(1, `rgba(14,165,233,${opacity * 0.05})`);

      ctx.strokeStyle = gradient;

      ctx.globalAlpha = 0.6 + opacity * 0.4;

      ctx.lineWidth = 0.6;

      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(particles[j].x, particles[j].y);
      ctx.stroke();

      ctx.globalAlpha = 1; // 🔥 WAJIB RESET
    }
  }
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

requestAnimationFrame(animateCursor);

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
window.addEventListener("scroll", activeNav);
window.addEventListener("load", activeNav);

activeNav();
