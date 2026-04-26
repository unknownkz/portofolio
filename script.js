// GSAP INIT
gsap.registerPlugin(ScrollTrigger);

// HERO ANIMATION
gsap.from(".hero-text h1", {
  y: 50,
  opacity: 0,
  duration: 1
});

gsap.from(".hero-text p", {
  y: 30,
  opacity: 0,
  delay: 0.3,
  duration: 1
});

gsap.from(".buttons", {
  y: 20,
  opacity: 0,
  delay: 0.6,
  duration: 1
});

gsap.from(".hero-img img", {
  scale: 0.8,
  opacity: 0,
  duration: 1.2,
  ease: "power3.out"
});

// SCROLL ANIMATION (SMOOTH)
gsap.utils.toArray(".card").forEach(card => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: "top 85%",
    },
    y: 50,
    opacity: 0,
    duration: 1
  });
});

// PARALLAX EFFECT
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  document.querySelector(".hero-img img").style.transform =
    `translateY(${scrollY * 0.1}px)`;
});

// NAV ACTIVE SMOOTH
const sections = document.querySelectorAll("section, header");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(sec => {
    if (scrollY >= sec.offsetTop - 100) {
      current = sec.id;
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});

// 3D TILT PREMIUM (SMOOTHER)
const img = document.querySelector(".hero-img img");

img.addEventListener("mousemove", e => {
  const rect = img.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const rotateX = (y / rect.height - 0.5) * -20;
  const rotateY = (x / rect.width - 0.5) * 20;

  gsap.to(img, {
    rotateX: rotateX,
    rotateY: rotateY,
    scale: 1.05,
    duration: 0.3
  });
});

img.addEventListener("mouseleave", () => {
  gsap.to(img, {
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    duration: 0.5
  });
});
