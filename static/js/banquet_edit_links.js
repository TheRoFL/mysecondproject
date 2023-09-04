// Получаем все кнопки с классом "menu-client-btn"
const menuButtons = document.querySelectorAll(".vash_zakaz");
const detailsButtons = document.querySelectorAll(".details-button");
const x1 = document.querySelector(".menuu");
const y1 = document.querySelector(".overflow2");

detailsButtons.forEach((button) => {
  button.addEventListener("click", function () {
    localStorage.setItem("is_additional", false);
    localStorage.setItem("current_client_id", button.dataset.id);
    localStorage.setItem("current_client_name", button.dataset.name);
    LoadMenu("all");
    menuButtons.forEach((button) => {
      var current_client_id = localStorage.getItem("current_client_id");
      var my_client_form = document.querySelector(
        `.my_client[data-id="${current_client_id}"]`
      );
      if (my_client_form) {
        my_client_form.classList.add("active");
      }
      button.classList.add("active");
    });
    x1.classList.remove("hidden2");
    y1.classList.remove("hidden2");
  });
});

const detailsButtonAdditional_ = document.querySelector(
  ".details-button-additional"
);
detailsButtonAdditional_.addEventListener("click", function () {
  LoadMenu("all", null, true);
  localStorage.setItem("is_additional", true);
  localStorage.setItem("current_client_name", "Дополнительные блюда");
  x1.classList.remove("hidden2");
  y1.classList.remove("hidden2");
});

document.addEventListener("keydown", (e) => {
  if (e.code == "Escape") {
    x1.classList.add("hidden2");
    y1.classList.add("hidden2");
  }
});

y1.addEventListener("click", () => {
  var gridContainer = document.querySelector(".grid-container");
  var chosenClient = document.querySelector(".my_client.active");
  if (chosenClient) {
    chosenClient.classList.remove("active");
  }
  gridContainer.classList.remove("menu-mode");

  setTimeout(() => {
    gridContainer.classList.remove("appear");
  }, 1);
  x1.classList.add("hidden2");
  y1.classList.add("hidden2");
});
