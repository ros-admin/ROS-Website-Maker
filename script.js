// typing effect
const text = "অলিম্পিয়াডের মাধ্যমে ভবিষ্যৎ গড়ি...";
let i = 0;

function typing() {
  if (i < text.length) {
    document.getElementById("typing").innerHTML += text.charAt(i);
    i++;
    setTimeout(typing, 40);
  }
}
typing();

// mobile menu
function toggleMenu(){
  let menu = document.getElementById("menu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}
