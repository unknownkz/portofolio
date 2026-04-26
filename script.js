// ================= MENU MOBILE =================
const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("navLinks");

if(toggle && nav){
  // ================= PREMIUM MOBILE MENU =================
const overlay = document.createElement("div");
overlay.classList.add("nav-overlay");
document.body.appendChild(overlay);

if(toggle && nav){

  toggle.addEventListener("click", () => {
    nav.classList.toggle("active");
    overlay.classList.toggle("active");
    toggle.classList.toggle("active");
  });

  // klik luar nutup
  overlay.addEventListener("click", ()=>{
    nav.classList.remove("active");
    overlay.classList.remove("active");
    toggle.classList.remove("active");
  });

  // klik menu nutup
  document.querySelectorAll(".nav-links a").forEach(link=>{
    link.addEventListener("click", ()=>{
      nav.classList.remove("active");
      overlay.classList.remove("active");
      toggle.classList.remove("active");
    });
  });
}
// ================= SMOOTH SCROLL =================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(e){
    e.preventDefault();

    const target = document.querySelector(this.getAttribute("href"));
    if(target){
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: "smooth"
      });
    }
  });
});
// auto close menu saat klik
document.querySelectorAll(".nav-links a").forEach(link=>{
  link.addEventListener("click", ()=>{
    if(nav) nav.classList.remove("active");
  });
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
  // ================= PARALLAX =================
window.addEventListener("scroll", ()=>{
  const scrolled = window.scrollY;
  document.body.style.backgroundPosition = `center ${scrolled * 0.2}px`;
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
      entry.target.style.transitionDelay = "0.1s";
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
// ================= CURSOR GLOW (FIXED) =================
const cursor = document.querySelector(".cursor-glow");

if(cursor){

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  window.addEventListener("mousemove", (e)=>{
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor(){
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;

    cursor.style.left = currentX + "px";
    cursor.style.top = currentY + "px";

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // HOVER EFFECT
  const hoverItems = document.querySelectorAll("a, button, .btn, .contact-btn");

  hoverItems.forEach(item=>{
    item.addEventListener("mouseenter", ()=>{
      cursor.classList.add("active");
    });

    item.addEventListener("mouseleave", ()=>{
      cursor.classList.remove("active");
    });
  });

  // CLICK EFFECT
  window.addEventListener("mousedown", ()=>{
    cursor.classList.add("click");
  });

  window.addEventListener("mouseup", ()=>{
    cursor.classList.remove("click");
  });
}
if(window.innerWidth < 768){
  if(cursor) cursor.style.display = "none";
}
  // ================= CURSOR SCALE =================
const interactive = document.querySelectorAll("a, button, .card");

interactive.forEach(el=>{
  el.addEventListener("mouseenter", ()=>{
    cursor.style.transform += " scale(1.5)";
  });

  el.addEventListener("mouseleave", ()=>{
    cursor.style.transform = cursor.style.transform.replace(" scale(1.5)", "");
  });
});
// ================= PERFORMANCE =================
if(window.innerWidth < 768){
  document.querySelectorAll(".cursor-glow").forEach(el=>el.remove());
}
// ================= INIT =================
activeNav();
