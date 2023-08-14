// Получаем все кнопки с классом "menu-client-btn"
const menuButtons = document.querySelectorAll(".menu-client-btn");
const x1 = document.querySelector(".menuu");
const y1 = document.querySelector(".overflow2");

menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    localStorage.setItem("current_client_id", button.dataset.id);
    localStorage.setItem("current_client_name", button.dataset.name);
    menuButtons.forEach((button) => {
      var current_client_id = localStorage.getItem("current_client_id");
      if (button.dataset.id == current_client_id) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
    x1.classList.remove("hidden2");
    y1.classList.remove("hidden2");

    const orderButtons = document.querySelectorAll(".order-button");
    var current_client_name = localStorage.getItem("current_client_name");
    function handleOrderButtonClick(event) {
      var username_id = localStorage.getItem("username_id");
      var clientId = localStorage.getItem("current_client_id");
      var current_dish_filter = localStorage.getItem("dish-filter");
      const data_to_send = {
        action: "added_dish",
        message: `Заказ "${event.target.dataset.name}" добавлен`,
        current_dish_id: event.target.dataset.id,
        current_user_id: username_id,
        current_client_id: clientId,
      };
      dish_filter = current_dish_filter;
      var is_menu = false;
      if (dish_filter == "samples") {
        is_menu = true;
      }
      if (is_menu) {
        const new_data_to_send = {
          action: "menu_add",
          message: `Заказ "${event.target.dataset.name}" добавлен`,
          current_menu_id: event.target.dataset.id,
          current_user_id: username_id,
          current_client_id: clientId,
        };
        socket.send(JSON.stringify(new_data_to_send));
      } else {
        socket.send(JSON.stringify(data_to_send));
      }
    }
    orderButtons.forEach((button) => {
      // Remove the old event listener, if any
      button.removeEventListener("click", handleOrderButtonClick);
      button.textContent = `Добавить для "${current_client_name}"`;
      button.addEventListener("click", handleOrderButtonClick);
    });
  });
});

// Получаем ссылку на клиентов по классу

document.addEventListener("keydown", (e) => {
  if (e.code == "Escape") {
    x1.classList.add("hidden2");
    y1.classList.add("hidden2");
  }
});

y1.addEventListener("click", () => {
  x1.classList.add("hidden2");
  y1.classList.add("hidden2");
});
