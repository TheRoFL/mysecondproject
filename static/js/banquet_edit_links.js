function CreateQuantityStatusButton(
  container,
  client_id,
  order_id,
  order_quantity
) {
  // Создание обертки для кнопок управления
  const deleteBtnWrapper = document.createElement("div");
  deleteBtnWrapper.className = "delete-btn-wrapper";

  const deleteBtnWrapper2 = document.createElement("div");
  deleteBtnWrapper2.className = "delete-btn-wrapper3";

  // Создание кнопки уменьшения
  const decreaseBtn = document.createElement("button");
  decreaseBtn.className = "decrease-btn2";
  decreaseBtn.setAttribute("data-id", order_id);
  decreaseBtn.setAttribute("data-clientid", client_id);

  const decreaseBtnSvg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  decreaseBtnSvg.setAttribute("width", "1em");
  decreaseBtnSvg.setAttribute("height", "1em");
  decreaseBtnSvg.setAttribute("viewBox", "0 0 24 24");
  decreaseBtnSvg.setAttribute("fill", "none");
  decreaseBtnSvg.className = "decrease-btn-svg";

  const decreaseBtnPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  decreaseBtnPath.setAttribute("fill-rule", "evenodd");
  decreaseBtnPath.setAttribute("clip-rule", "evenodd");
  decreaseBtnPath.setAttribute(
    "d",
    "M6 12a1 1 0 0 0 1 1h10a1 1 0 1 0 0-2H7a1 1 0 0 0-1 1Z"
  );
  decreaseBtnPath.setAttribute("fill", "currentColor");

  decreaseBtnSvg.appendChild(decreaseBtnPath);
  decreaseBtn.appendChild(decreaseBtnSvg);

  // Создание спана для вывода числа
  const dishNumberInput = document.createElement("span");
  dishNumberInput.className = "dish-number-input2";
  dishNumberInput.setAttribute("data-id", client_id);
  dishNumberInput.setAttribute("data-dish-id", order_id);
  dishNumberInput.setAttribute("type", "text");
  dishNumberInput.textContent = order_quantity;

  // Создание кнопки увеличения
  const increaseBtn = document.createElement("button");
  increaseBtn.className = "increase-btn2";
  increaseBtn.setAttribute("data-id", order_id);
  increaseBtn.setAttribute("data-clientid", client_id);

  const increaseBtnSvg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  increaseBtnSvg.setAttribute("width", "1em");
  increaseBtnSvg.setAttribute("height", "1em");
  increaseBtnSvg.setAttribute("viewBox", "0 0 24 24");
  increaseBtnSvg.setAttribute("fill", "none");
  increaseBtnSvg.className = "increase-btn-svg2";

  const increaseBtnPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  increaseBtnPath.setAttribute("fill-rule", "evenodd");
  increaseBtnPath.setAttribute("clip-rule", "evenodd");
  increaseBtnPath.setAttribute(
    "d",
    "M12 6a1 1 0 0 0-1 1v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7a1 1 0 0 0-1-1Z"
  );
  increaseBtnPath.setAttribute("fill", "currentColor");

  increaseBtnSvg.appendChild(increaseBtnPath);
  increaseBtn.appendChild(increaseBtnSvg);

  // Добавление элементов на страницу
  deleteBtnWrapper2.appendChild(decreaseBtn);
  deleteBtnWrapper2.appendChild(dishNumberInput);
  deleteBtnWrapper2.appendChild(increaseBtn);
  deleteBtnWrapper.appendChild(deleteBtnWrapper2);

  if (container) {
    container.appendChild(deleteBtnWrapper);
  }

  increaseBtn.addEventListener("click", () => {
    const order_id = increaseBtn.dataset.id;
    const client_id = increaseBtn.dataset.clientid;
    socket.send(
      JSON.stringify({
        action: "additional_order_increase",
        order_id: order_id,
        client_id: client_id,
        current_client_id: client_id,
        current_user_id: current_user_id,
      })
    );
  });

  decreaseBtn.addEventListener("click", () => {
    const order_id = decreaseBtn.dataset.id;
    const client_id = decreaseBtn.dataset.clientid;
    socket.send(
      JSON.stringify({
        action: "additional_order_decrease",
        order_id: order_id,
        client_id: client_id,
        current_client_id: client_id,
        current_user_id: current_user_id,
      })
    );
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
