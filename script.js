// ================= MENU MOBILE =================
const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("navLinks");

toggle.onclick = () => {
  nav.classList.toggle("active");
};

// auto close menu saat klik
document.querySelectorAll(".nav-links a").forEach(link=>{
  link.addEventListener("click", ()=>{
    nav.classList.remove("active");
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


// ================= SKILL ANIMATION =================
const skills = document.querySelectorAll(".bar span");

function animateSkills(){
  skills.forEach(skill => {
    const pos = skill.getBoundingClientRect().top;

    if(pos < window.innerHeight - 100 && !skill.classList.contains("done")){
      skill.style.width = skill.getAttribute("style").replace("width:", "");
      skill.classList.add("done"); // biar tidak ulang
    }
  });
}


// ================= SCROLL REVEAL =================
const cards = document.querySelectorAll(".card");

cards.forEach(c=>{
  c.style.opacity = 0;
  c.style.transform = "translateY(40px)";
  c.style.transition = "0.6s ease";
});

function revealCards(){
  cards.forEach(c=>{
    const pos = c.getBoundingClientRect().top;

    if(pos < window.innerHeight - 100){
      c.style.opacity = 1;
      c.style.transform = "translateY(0)";
    }
  });
}


// ================= SCROLL OPTIMIZATION =================
let ticking = false;

window.addEventListener("scroll", () => {
  if(!ticking){
    window.requestAnimationFrame(() => {
      activeNav();
      animateSkills();
      revealCards();
      ticking = false;
    });
    ticking = true;
  }
});


// ================= INIT =================
activeNav();
animateSkills();
revealCards();
