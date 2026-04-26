// THEME
function toggleMode(){
  document.body.classList.toggle("light");
  localStorage.setItem("mode", document.body.classList.contains("light"));
}

if(localStorage.getItem("mode") === "true"){
  document.body.classList.add("light");
}
