function handleDeleteDishButtonClickFromMenu(button) {
  const order_id = button.dataset.id;
  var username_id = localStorage.getItem("username_id");
  var current_client_id = localStorage.getItem("current_client_id");

  // Выполняем необходимые действия с полученными данными
  ChangeBanquetData({
    action: "dish_order_delete_new",
    order_id: order_id,
    current_user_id: username_id,
    client_id: current_client_id,
  });
}

function handleDeleteMenuButtonClick(button) {
  const menu_id = button.dataset.id; // Получаем значение data-id из атрибута data-id
  var username_id = localStorage.getItem("username_id");
  var current_client_id = localStorage.getItem("current_client_id");
  ChangeBanquetData({
    action: "client_menu_delete",
    menu_id: menu_id,
    current_user_id: username_id,
    client_id: current_client_id,
  });
}

function handleButtonClick(button) {
  var username_id = localStorage.getItem("username_id");
  var clientId = localStorage.getItem("current_client_id");
  var clientName = localStorage.getItem("current_client_name");
  if (clientName == "") {
    clientName = "Дополнительные блюда";
  }
  var current_dish_filter = localStorage.getItem("dish-filter");

  var dishId = button.dataset.id;
  var dishTitle = button.dataset.name;

  const data_to_send = {
    action: "added_dish",
    message: `Заказ "${dishTitle}" добавлен`,
    current_dish_id: dishId,
    current_user_id: username_id,
    current_client_id: clientId,
  };

  var is_menu = false;

  if (button.classList.contains("chosen")) {
    handleDeleteDishButtonClickFromMenu(button);
    button.classList.remove("chosen");
    button.textContent = `Выбрать для "${clientName}"`;
  } else {
    if (is_menu) {
      const new_data_to_send = {
        action: "menu_add",
        message: `Заказ "${dishTitle}" добавлен`,
        current_menu_id: dishId,
        current_user_id: username_id,
        current_client_id: clientId,
      };

      var orderMenuButtons = document.querySelectorAll(`.order-menu-button`);
      orderMenuButtons.forEach((orderButton) => {
        orderButton.classList.remove("chosen");
        orderButton.textContent = `Выбрать для "${clientName}"`;
      });

      button.classList.add("chosen");
      button.textContent = `Удалить для "${clientName}"`;
      ChangeBanquetData(new_data_to_send);
    } else {
      button.classList.add("chosen");
      button.textContent = `Удалить для "${clientName}"`;
      ChangeBanquetData(data_to_send);
    }
  }
}

function handleButtonMenuClick(button) {
  var username_id = localStorage.getItem("username_id");
  var clientId = localStorage.getItem("current_client_id");
  var clientName = localStorage.getItem("current_client_name");
  if (clientName == "") {
    clientName = "Дополнительные блюда";
  }

  var dishId = button.dataset.id;
  var dishTitle = button.dataset.name;

  if (button.classList.contains("chosen")) {
    handleDeleteMenuButtonClick(button);
    button.classList.remove("chosen");
    button.textContent = `Выбрать для "${clientName}"`;
  } else {
    const new_data_to_send = {
      action: "menu_add",
      message: `Заказ "${dishTitle}" добавлен`,
      current_menu_id: dishId,
      current_user_id: username_id,
      current_client_id: clientId,
    };

    var orderMenuButtons = document.querySelectorAll(`.order-menu-button`);
    orderMenuButtons.forEach((orderButton) => {
      orderButton.classList.remove("chosen");
      orderButton.textContent = `Выбрать для "${clientName}"`;
    });

    button.classList.add("chosen");
    button.textContent = `Удалить для "${clientName}"`;
    ChangeBanquetData(new_data_to_send);
  }
}

function handleButtonClickAddittional(button) {
  var username_id = localStorage.getItem("username_id");
  var clientName = "Дополнительные блюда";

  var dishId = button.dataset.id;

  const data_to_send = {
    action: "added_dish_additional",
    current_dish_id: dishId,
    current_user_id: username_id,
  };

  if (button.classList.contains("chosen")) {
    handleDeleteDishButtonClickFromMenu(button);
    button.classList.remove("chosen");
    button.textContent = `Выбрать для "${clientName}"`;
  } else {
    button.classList.add("chosen");
    button.textContent = `Удалить для "${clientName}"`;

    ChangeBanquetData(data_to_send);
  }
}

function handleSepOrderClick(button) {
  var username_id = localStorage.getItem("username_id");
  var clientId = localStorage.getItem("current_client_id");
  var clientName = localStorage.getItem("current_client_name");

  var dishId = button.dataset.id;
  var dishTitle = button.dataset.name;

  const data_to_send = {
    action: "menu_add_sep",
    message: `Заказ "${dishTitle}" добавлен`,
    current_menu_id: dishId,
    current_user_id: username_id,
    current_client_id: clientId,
  };

  ChangeBanquetData(data_to_send);

  var menu_id = button.dataset.id;
  var order_sep_button = document.querySelector(
    `.order-sep-button[data-id="${menu_id}"]`
  );
  order_sep_button.textContent = `Выбрано по отдельности для "${clientName}"`;
  order_sep_button.disabled = true;
}

function handleNewClientClick(button) {
  var main = document.querySelectorAll(`.my_client`);
  main.forEach((btn) => {
    btn.classList.remove("active");
  });

  var main = document.querySelector(
    `.my_client[data-id="${button.dataset.id}"]`
  );
  main.classList.add("active");

  var filter = $(button).data("filter"); // Получаем значение data-filter
  localStorage.setItem("dish-filter", filter);
  var requestParams = {
    "dish-filter": filter, // Используем полученное значение для параметра запроса
  };

  $.ajax({
    url: "http://127.0.0.1:8000/banquet/",
    method: "GET",
    data: requestParams,
    dataType: "json",
    success: function (data) {
      data = JSON.parse(data);

      // Остальной код обработки данных

      const orderButtons = document.querySelectorAll(".order-button");
      var clientId = localStorage.getItem("current_client_id");

      orderButtons.forEach((button) => {
        const dishId = button.dataset.id;
        const dishTittle = button.dataset.name;

        button.addEventListener("click", function () {
          var username_id = localStorage.getItem("username_id");
          var clientId = localStorage.getItem("current_client_id");
          var clientName = localStorage.getItem("current_client_name");
          var current_dish_filter = localStorage.getItem("dish-filter");
          const data_to_send = {
            action: "added_dish",
            message: `Заказ "${dishTittle}" добавлен`,
            current_dish_id: dishId,
            current_user_id: username_id,
            current_client_id: clientId,
          };
          dish_filter = current_dish_filter;
          var is_menu = false;
          if (dish_filter == "samples") {
            is_menu = true;
          }
          if (button.classList.contains("chosen")) {
            handleDeleteDishButtonClickFromMenu(button);
            button.classList.remove("chosen");
            button.textContent = `Выбрать для "${clientName}"`;
          } else {
            if (is_menu) {
              const new_data_to_send = {
                action: "menu_add",
                message: `Заказ "${button.dataset.name}" добавлен`,
                current_menu_id: button.dataset.id,
                current_user_id: username_id,
                current_client_id: clientId,
              };
              ChangeBanquetData(new_data_to_send);
            } else {
              button.classList.add("chosen");
              button.textContent = `Удалить для "${clientName}"`;
              ChangeBanquetData(data_to_send);
            }
          }
        });
      });

      var animate_orderButtons = document.querySelectorAll(".order-button");
      animate_orderButtons.forEach((button) => {
        button.addEventListener("click", function () {
          var dishImage = document.querySelector(
            `.grid-dish-img[data-id="${button.dataset.id}"]`
          );
          dishImage.classList.add("highlight-image");

          setTimeout(function () {
            dishImage.classList.remove("highlight-image");
          }, 300);
        });
      });
    },
    error: function (xhr, status, error) {
      console.error(error);
    },
  });

  localStorage.setItem("current_client_id", button.dataset.id);
  localStorage.setItem("current_client_name", button.dataset.name);
  menuButtons.forEach((btn) => {
    var current_client_id = localStorage.getItem("current_client_id");
    if (btn.dataset.id == current_client_id) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  x1.classList.remove("hidden2");
  y1.classList.remove("hidden2");
}

function handleDishImgClick(event) {
  const adittionalDish = event.target;
  adittionalDish.classList.add("active");
  x = document.getElementById(
    "overflow" + adittionalDish.getAttribute("data-id")
  );
  y = document.getElementById(
    "modWind" + adittionalDish.getAttribute("data-id")
  );

  x.classList.remove("hidden");
  y.classList.remove("hidden");

  var exit = document.getElementById(
    "overflow" + adittionalDish.getAttribute("data-id")
  );

  exit.addEventListener("click", () => {
    x = document.getElementById(
      "overflow" + adittionalDish.getAttribute("data-id")
    );
    y = document.getElementById(
      "modWind" + adittionalDish.getAttribute("data-id")
    );
    x.classList.add("hidden");
    y.classList.add("hidden");
  });
}
