// ===== THEME (dark/light) =====
const themeToggle = document.getElementById('themeToggle');

function applySavedTheme(){
  const isLight = localStorage.getItem('theme') === 'light';
  document.body.classList.toggle('light', isLight);
  if(themeToggle){
    themeToggle.textContent = isLight ? '☀️' : '🌙';
  }
}
applySavedTheme();

themeToggle?.addEventListener('click', () => {
  const nowLight = !document.body.classList.contains('light');
  document.body.classList.toggle('light', nowLight);
  localStorage.setItem('theme', nowLight ? 'light' : 'dark');
  themeToggle.textContent = nowLight ? '☀️' : '🌙';
});

// ===== MENU MOBILE =====
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// close menu saat klik link
document.querySelectorAll('.nav-links a').forEach(a=>{
  a.addEventListener('click', ()=> navLinks.classList.remove('active'));
});

// ===== SCROLL REVEAL (smooth) =====
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('active');
      io.unobserve(entry.target);
    }
  });
},{ threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el=> io.observe(el));
