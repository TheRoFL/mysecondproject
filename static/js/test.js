const ws = document.querySelectorAll(".dishes");
console.log(ws.length);
for (let i = 1; i < ws.length; i++) {
  const div = `<div class = "overflow hidden"></div>
    <div class="modWind hidden">
    <div ><img style = "width: 200px"
    src="http://localhost:8000/media/menu_images/${ws[i].getAttribute(
      "data-type"
    )}/${ws[i].getAttribute("data-name")}.png"
    /> </div>
      <div class="name">${ws[i].getAttribute("data-name")}</div>
      <div class="grams">${ws[i].getAttribute("data-weight")} гр</div>
      <div class="price">${ws[i].getAttribute("data-price")} руб</div>
      <div class="sostav">${ws[i].getAttribute("data-sostav")}</div>
  </div>
  `;
  document.querySelector(".dishes").insertAdjacentHTML("beforebegin", div);

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
