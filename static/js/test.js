function wind() {
  const div = `<div class = "overflow hidden"></div>
  <div class="modWind hidden">
    <div class="name">Борщ</div>
    <div class="grams">200гр</div>
    <p class="kbju">Белки 10г Жиры 10г Угл 10г Ккал 100</p>
    <img src="" alt="" class="food" />
    <p class="sostav">АА,bb,cc</p>
</div>
`;
  document.querySelector(".dishes").insertAdjacentHTML("beforebegin", div);
}

const ws = document.querySelectorAll(".dishes");
for (let i = 0; i < ws.length; i++) {
  wind();
  ws[i].addEventListener("click", () => {
    x.classList.remove("hidden");
    y.classList.remove("hidden");
  });
}

const x = document.querySelector(".modWind");
const y = document.querySelector(".overflow");

document.addEventListener("keydown", (e) => {
  if (e.code == "Escape") {
    x.classList.add("hidden");
    y.classList.add("hidden");
  }
});

document.querySelector(".overflow").addEventListener("click", () => {
  x.classList.add("hidden");
  y.classList.add("hidden");
});
