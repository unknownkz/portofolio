// THEME
const themeToggle = document.getElementById("themeToggle");

themeToggle.onclick = () => {
  document.body.classList.toggle("light");
};

// MENU MOBILE
document.getElementById("menuToggle").onclick = () => {
  document.getElementById("navLinks").classList.toggle("active");
};

// SCROLL REVEAL
const reveals = document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {
  reveals.forEach(el => {
    if(el.getBoundingClientRect().top < window.innerHeight - 100){
      el.classList.add("active");
    }
  });
});

// ACTIVE NAV
const sections = document.querySelectorAll("section, header");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(section => {
    if(scrollY >= section.offsetTop - 100){
      current = section.id;
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if(link.getAttribute("href") === "#" + current){
      link.classList.add("active");
    }
  });
});

// 3D TILT FOTO
const img = document.querySelector(".hero-img img");

img.addEventListener("mousemove", e => {
  const rect = img.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const rx = -(y / rect.height - 0.5) * 15;
  const ry = (x / rect.width - 0.5) * 15;

  img.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.05)`;
});

img.addEventListener("mouseleave", () => {
  img.style.transform = "rotateX(0) rotateY(0)";
});
