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


// ================= INIT =================
activeNav();
