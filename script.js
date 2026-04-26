// THEME
function toggleMode(){
  document.body.classList.toggle("light");
  localStorage.setItem("mode", document.body.classList.contains("light"));
}

if(localStorage.getItem("mode") === "true"){
  document.body.classList.add("light");
}

// MENU MOBILE
function toggleMenu(){
  document.getElementById("navLinks").classList.toggle("active");
}

// SCROLL REVEAL
const reveals = document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {
  reveals.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if(top < window.innerHeight - 100){
      el.classList.add("active");
    }
  });
});
