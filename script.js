// ================= MENU MOBILE =================
const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("navLinks");

if(toggle && nav){
  toggle.onclick = () => {
    nav.classList.toggle("active");
  };
}

// auto close menu saat klik
document.querySelectorAll(".nav-links a").forEach(link=>{
  link.addEventListener("click", ()=>{
    if(nav) nav.classList.remove("active");
  });
});


// ================= ACTIVE NAV =================
const sections = document.querySelectorAll("section, header");
const links = document.querySelectorAll(".nav-links a");

function activeNav(){
  let current = "";

  sections.forEach(sec => {
    if(window.scrollY >= sec.offsetTop - 120){
      current = sec.id;
    }
  });

  links.forEach(link => {
    link.classList.remove("active");
    if(link.getAttribute("href") === "#" + current){
      link.classList.add("active");
    }
  });
}


// ================= SKILL ANIMATION (PREMIUM) =================
const skillBars = document.querySelectorAll(".bar span");

const skillObserver = new IntersectionObserver((entries)=>{
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


// ================= SCROLL REVEAL (PREMIUM) =================
const revealElements = document.querySelectorAll("section, .card");

const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("active");
    }
  });
},{
  threshold:0.15
});

// kasih class awal
revealElements.forEach(el=>{
  el.classList.add("reveal");
  revealObserver.observe(el);
});


// ================= WA BUTTON ANIMATION =================
const waBtn = document.querySelector(".wa-btn");

if(waBtn){
  setInterval(()=>{
    waBtn.style.transform = "scale(1.05)";
    setTimeout(()=>{
      waBtn.style.transform = "scale(1)";
    }, 300);
  }, 2000);
}


// ================= SCROLL OPTIMIZATION =================
let ticking = false;

window.addEventListener("scroll", () => {
  if(!ticking){
    window.requestAnimationFrame(() => {
      activeNav();
      ticking = false;
    });
    ticking = true;
  }
});

// ================= LOGO 3D TILT =================
const logo = document.querySelector(".logo-icon");

if(logo){
  logo.addEventListener("mousemove", (e)=>{
    const rect = logo.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = -(y - rect.height/2) / 6;
    const rotateY = (x - rect.width/2) / 6;

    logo.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`;
  });

  logo.addEventListener("mouseleave", ()=>{
    logo.style.transform = "rotateX(0) rotateY(0) scale(1)";
  });
}
// ================= DARK / LIGHT TOGGLE (PREMIUM) =================
const themeBtn = document.getElementById("themeToggle");

// CEK SIMPANAN SAAT LOAD
if(localStorage.getItem("theme") === "light"){
  document.body.classList.add("light-mode");
  if(themeBtn){
    themeBtn.innerHTML = '<span class="toggle-circle"></span><i class="fas fa-sun"></i>';
  }
}

// CLICK TOGGLE
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
// ================= CURSOR GLOW (PREMIUM UPGRADE) =================
const cursor = document.querySelector(".cursor-glow");

if(cursor){

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  // ambil posisi mouse
  window.addEventListener("mousemove", (e)=>{
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // smooth follow (biar tidak patah-patah)
  function animateCursor(){
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;

    cursor.style.left = currentX + "px";
    cursor.style.top = currentY + "px";

    requestAnimationFrame(animateCursor);
  }

  animateCursor();
/* ================= CARD HOVER DEPTH ================= */
.card{
  transition:all 0.3s ease;
}

.card:hover{
  transform:translateY(-5px) scale(1.01);
  box-shadow:0 20px 40px rgba(0,0,0,0.4);
}
// ================= CURSOR INTERACTION =================
const hoverElements = document.querySelectorAll("a, button, .contact-btn, .btn");

hoverElements.forEach(el=>{
  el.addEventListener("mouseenter", ()=>{
    cursor.classList.add("active");
  });

  el.addEventListener("mouseleave", ()=>{
    cursor.classList.remove("active");
  });
});

  // ================= PARALLAX PREMIUM =================
window.addEventListener("scroll", ()=>{
  const scrollY = window.scrollY;

  document.body.style.backgroundPosition = `0% ${scrollY * 0.05}%`;
});
  // ================= NAVBAR SCROLL EFFECT =================
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", ()=>{
  if(window.scrollY > 50){
    navbar.classList.add("scrolled");
  }else{
    navbar.classList.remove("scrolled");
  }
});
  

// ================= INIT =================
activeNav();
