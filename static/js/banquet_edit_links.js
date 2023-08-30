function ChangeChosenStatus() {
  var clientId = localStorage.getItem("current_client_id");
  var clientName = localStorage.getItem("current_client_name");
  var orderButtons_ = document.querySelectorAll(".order-button");

  var all_dishes = [];
  orderButtons_.forEach((button) => {
    const dishId = button.dataset.id;
    all_dishes.push(dishId);
  });

  const filter_ = localStorage.getItem("dish-filter");
  var requestParams2 = {};
  if (filter_ != "samples") {
    requestParams2 = {
      action: "dish",
      dish_ids: all_dishes,
      client_id: clientId,
    };
  } else {
    requestParams2 = {
      action: "menu",
      dish_ids: all_dishes,
      client_id: clientId,
    };
  }
  $.ajax({
    url: "http://127.0.0.1:8000/banquet/json/",
    method: "GET",
    data: requestParams2,
    dataType: "json",
    success: function (data) {
      data = JSON.parse(data);
      console.log(data);

      orderButtons_.forEach((button) => {
        const dishId = button.dataset.id;
        if (Array.isArray(data)) {
          if (data.includes(Number(dishId))) {
            const button_to_delete = document.querySelector(
              `.order-button[data-id="${dishId}"]`
            );
            if (button_to_delete) {
              button_to_delete.textContent = `Удалить для "${clientName}"`;
              button_to_delete.classList.add("chosen");
            }
          }
        }
      });
    },
    error: function (xhr, status, error) {
      console.error(error);
    },
  });
}

// Получаем все кнопки с классом "menu-client-btn"
const menuButtons = document.querySelectorAll(".vash_zakaz");
const detailsButtons = document.querySelectorAll(".details-button");
const x1 = document.querySelector(".menuu");
const y1 = document.querySelector(".overflow2");

detailsButtons.forEach((button) => {
  button.addEventListener("click", function (event) {
    if (
      !event.target.classList.contains("delete-btn") &&
      !event.target.classList.contains("delete-menu-btn") &&
      !event.target.classList.contains("delete-btn-wrapper2") &&
      !event.target.classList.contains("dish-number-input") &&
      !event.target.classList.contains("increase-btn-svg") &&
      !event.target.classList.contains("decrease-btn-svg")
    ) {
      event.stopPropagation();
      // костыль, который прогружает заново меню и навешивает лисенеры, и более не навешивается более 1
      LoadMenu("all");

      localStorage.setItem("current_client_id", button.dataset.id);
      localStorage.setItem("current_client_name", button.dataset.name);
      menuButtons.forEach((button) => {
        var current_client_id = localStorage.getItem("current_client_id");
        var my_client_form = document.querySelector(
          `.my_client[data-id="${current_client_id}"]`
        );
        my_client_form.classList.add("active");
        button.classList.add("active");
      });
      x1.classList.remove("hidden2");
      y1.classList.remove("hidden2");

      const orderButtons = document.querySelectorAll(".order-button");
      var current_client_name = localStorage.getItem("current_client_name");
      // херь, которая обрабатывает нажатие на кнопку заказать
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
        button.removeEventListener("click", handleOrderButtonClick, true);
        button.textContent = `Выбрать для "${current_client_name}"`;
        button.addEventListener("click", handleOrderButtonClick);
      });
    }
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
