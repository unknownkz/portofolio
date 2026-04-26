// MENU MOBILE
const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("navLinks");

toggle.onclick = () => nav.classList.toggle("active");

// ACTIVE NAV
const sections = document.querySelectorAll("section, header");
const links = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(sec => {
    if(scrollY >= sec.offsetTop - 100){
      current = sec.id;
    }
  });

  links.forEach(link => {
    link.classList.remove("active");
    if(link.getAttribute("href") === "#" + current){
      link.classList.add("active");
    }
  });
});

// SKILL ANIMATION
const skills = document.querySelectorAll(".bar span");

window.addEventListener("scroll", () => {
  skills.forEach(skill => {
    const pos = skill.getBoundingClientRect().top;
    if(pos < window.innerHeight - 100){
      skill.style.width = skill.getAttribute("style").replace("width:", "");
    }
  });
});

// SCROLL ANIMATION
const cards = document.querySelectorAll(".card");

cards.forEach(c=>{
  c.style.opacity=0;
  c.style.transform="translateY(30px)";
  c.style.transition="0.6s";
});

window.addEventListener("scroll", ()=>{
  cards.forEach(c=>{
    if(c.getBoundingClientRect().top < window.innerHeight - 100){
      c.style.opacity=1;
      c.style.transform="translateY(0)";
    }
  });
});
