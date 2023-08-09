const ws = document.querySelectorAll(".dishes");
var x = 0;
var y = 0;
for (let i = 0; i < ws.length; i++) {
  var div = `<div class = "overflow hidden" id="${i}"></div>
    <div class="modWind hidden" id="${i + 3500}">
    <div ><img style = "width: 200px"
    src="http://localhost:8000/media/menu_images/${ws[i].getAttribute(
      "data-type"
    )}/${ws[i].getAttribute("data-tittle")}.png"
    /> </div>
      <div class="name">${ws[i].getAttribute("data-name")}</div>
      <div class="grams">${ws[i].getAttribute("data-weight")} гр</div>
      <div class="price">${ws[i].getAttribute("data-price")} руб</div>
      <div class="sostav">${ws[i].getAttribute("data-sostav")}</div>
  </div>
  `;
  document.querySelector(".dishes").insertAdjacentHTML("beforebegin", div);

  ws[i].addEventListener("click", () => {
    x = document.getElementById(i);
    y = document.getElementById(i + 3500);
    x.classList.remove("hidden");
    y.classList.remove("hidden");
  });

  const exit = document.querySelectorAll(".overflow");

  exit.forEach((element) => {
    element.addEventListener("click", () => {
      x = document.getElementById(i);
      y = document.getElementById(i + 3500);
      x.classList.add("hidden");
      y.classList.add("hidden");
    });
  });
}

document.addEventListener("keydown", (e) => {
  if (e.code == "Escape") {
    x.classList.add("hidden");
    y.classList.add("hidden");
  }
});
