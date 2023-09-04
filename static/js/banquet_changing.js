function updateClientsList(data) {
  type = data.type;
  quantity = data.quantity;
  client_id = data.client_id;
  client_name = data.client_name;
  var newDiv = $("<div>", { class: "my_client", "data-id": client_id });

  var nameInput = $("<input>", {
    class: "name-input",
    "data-id": client_id,
    value: type,
  });
  var quantityInput = $("<input>", {
    class: "quantity-input",
    "data-id": client_id,
    value: quantity,
  });

  function updateQuantity(client_id, quantity) {
    username_id = localStorage.getItem("username_id");
    socket.send(
      JSON.stringify({
        action: "client_quantity_update",
        client_id: client_id,
        current_user_id: username_id,
        quantity: quantity,
      })
    );
  }

  var quantityLabel = $("<span>", { text: " человек " });

  var deleteBtn = $("<button>", {
    class: "delete-client-btn",
    "data-id": client_id,
    text: " Удалить ",
  });
  var menuBtn = $("<button>", {
    class: "menu-client-btn",
    "data-id": client_id,
    text: " Выбрать для редактирования ",
  });

  // Добавляем элементы внутрь созданного div
  newDiv.append(
    nameInput,
    " в количестве ",
    quantityInput,
    quantityLabel,
    deleteBtn,
    menuBtn
  );

  // Добавляем созданный div внутрь <div class="my_extra_clients">
  $(".my_extra_clients").append(newDiv);

  const deleteButtons = document.querySelectorAll(".delete-client-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", handleDeleteClientButtonClick);
  });

  const quantity_inputs = document.querySelectorAll(".quantity-input");
  function quantity_input_change() {
    const client_id = $(this).data("id");
    const quantity = Math.max(1, $(this).val()); // Ensure the quantity is not less than 1
    updateQuantity(client_id, quantity);
  }

  // Присваиваем обработчик события "click" каждому input из массива quantity_inputs
  quantity_inputs.forEach((input) => {
    input.addEventListener("click", quantity_input_change);
  });

  // Создаем элементы
  var clientHeader = $("<div>", {
    class: "client-header",
    "data-id": client_id,
  });
  var clientInfo = $("<div>", { class: "client-info" });
  var clientInfoH1 = $("<h1>", {
    class: "client-info-h1",
    "data-id": client_id,
  });
  clientInfoH1.html(
    `Меню для клиента типа "<span class='client-name' data-id='${client_id}'>${client_name}</span>" 
    в количестве <span class='client-quantity' data-id='${client_id}'>${quantity}</span> человек`
  );
  clientInfo.append(clientInfoH1);

  var clientContainer = $("<div>", {
    class: `client-container-${client_id}`,
    id: `client-container-${client_id}`,
  });

  var clientTotalPrice = $("<h2>", {
    class: "client-total-price",
    style: "margin-top: 50px; margin-left: 20px",
  });
  clientTotalPrice.html(
    `Итого за всех клиентов: <span class='order-price-count' data-id='${client_id}' 
    id='${client_id}'>0</span>.00 ₽ x <span class='client-quantity-2'
     data-id='${client_id}'>${quantity}</span> человек = <span class='client-price-count' 
     data-id='${client_id}' id='${client_id}'>0</span>.00 ₽`
  );

  // Добавляем элементы на страницу
  clientHeader.append(clientInfo, clientContainer, clientTotalPrice);
  clientHeader.append("<h1>&nbsp;</h1>");
  var allClientsDiv = $(".all_clients");
  allClientsDiv.append(clientHeader);

  // Добавляем элемент <h1>&nbsp;</h1> как указано в вашем коде
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
              socket.send(JSON.stringify(new_data_to_send));
            } else {
              button.classList.add("chosen");
              button.textContent = `Удалить для "${clientName}"`;
              socket.send(JSON.stringify(data_to_send));
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

function updateQuantity(client_id, quantity) {
  username_id = localStorage.getItem("username_id");
  socket.send(
    JSON.stringify({
      action: "client_quantity_update",
      client_id: client_id,
      current_user_id: username_id,
      quantity: quantity,
    })
  );
}

function handleDeleteClientButtonClick(event) {
  const client_id = event.target.dataset.id; // Получаем id клиента из атрибута data-id
  username_id = localStorage.getItem("username_id");
  current_client_id = localStorage.getItem("current_client_id");
  socket.send(
    JSON.stringify({
      action: "client_delete",
      client_id: client_id,
      current_user_id: username_id,
      current_client_id: current_client_id,
    })
  );
}

function handleDeleteDishButtonClick(event) {
  const mybutton = event.target; // Получаем элемент, на котором произошло событие (в данном случае, кнопка)
  const order_id = mybutton.dataset.id; // Получаем значение data-id из атрибута data-id
  var username_id = localStorage.getItem("username_id");
  var current_client_id = mybutton.dataset.clientid;
  socket.send(
    JSON.stringify({
      action: "dish_order_delete",
      order_id: order_id,
      current_user_id: username_id,
      client_id: current_client_id,
    })
  );
}

function handleDeleteMenuButtonClick(event) {
  const mybutton = event.target; // Получаем элемент, на котором произошло событие (в данном случае, кнопка)
  const menu_id = mybutton.dataset.id; // Получаем значение data-id из атрибута data-id
  var username_id = localStorage.getItem("username_id");
  var current_client_id = mybutton.dataset.clientid;
  socket.send(
    JSON.stringify({
      action: "client_menu_delete",
      menu_id: menu_id,
      current_user_id: username_id,
      client_id: current_client_id,
    })
  );
}

const socket = new ReconnectingWebSocket(
  "ws://" + window.location.host + "/ws/BanquetEditingSocket/"
);

socket.onopen = function () {
  console.log("BanquetEditingSocket соединение открыто.");
};

socket.onmessage = function (e) {
  const data = JSON.parse(e.data);
  console.log(data);
  action = data["action"];
  if (action === "client_added") {
    updateClientsList(data);
    client_id = data["client_id"];
    client_name = data["client_name"];
    const my_client = document.querySelector(".my_client.created");
    my_client.setAttribute("data-id", client_id);
    my_client.classList.remove("created");

    const button = document.querySelector(".vash_zakaz.created");
    button.setAttribute("data-id", client_id);
    button.setAttribute("data-name", client_name);
    button.classList.remove("created");

    const detailsButton = document.querySelector(".details-button.created");
    detailsButton.addEventListener("click", function (event) {
      if (
        !event.target.classList.contains("delete-btn") &&
        !event.target.classList.contains("delete-menu-btn")
      ) {
        event.stopPropagation();
        LoadMenu("all");
        localStorage.setItem("is_additional", false);
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

        function handleOrderButtonClick(button) {
          const dishId = button.dataset.id;
          const dishTittle = button.dataset.name;
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
            if (!is_menu) {
              handleDeleteDishButtonClickFromMenu(button);
            } else {
              handleDeleteMenuButtonClick(button);
            }
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

              orderButtons.forEach((button) => {
                button.classList.remove("chosen");
                button.textContent = `Выбрать для "${clientName}"`;
              });

              button.classList.add("chosen");
              button.textContent = `Удалить для "${clientName}"`;
              socket.send(JSON.stringify(new_data_to_send));
            } else {
              button.classList.add("chosen");
              button.textContent = `Удалить для "${clientName}"`;
              socket.send(JSON.stringify(data_to_send));
            }
          }
        }

        orderButtons.forEach((button) => {
          // Remove the old event listener, if any
          button.removeEventListener("click", handleOrderButtonClick, true);
          button.textContent = `Добавить для "${current_client_name}"`;
          button.addEventListener("click", handleOrderButtonClick);
        });
      }
    });
    const newClientNameInput = document.querySelector(".name-input.created");
    newClientNameInput.setAttribute("data-id", client_id);
    newClientNameInput.classList.remove("created");

    const newClientQuantityInput = document.querySelector(
      ".quantity-input.created"
    );

    newClientQuantityInput.setAttribute("data-id", client_id);
    newClientQuantityInput.classList.remove("created");

    const newClientDeleteBtn = document.querySelector(
      ".delete-client-btn.created"
    );
    newClientDeleteBtn.setAttribute("data-id", client_id);
    newClientDeleteBtn.dataset.id = client_id;
    newClientDeleteBtn.classList.remove("created");

    const newClientDeleteImg = document.querySelector(".musorka.created");
    newClientDeleteImg.setAttribute("data-id", client_id);
    newClientDeleteImg.dataset.id = client_id;
    newClientDeleteImg.classList.remove("created");

    const NewClientMenu = document.querySelector(".client-menu.created");
    NewClientMenu.setAttribute("data-id", client_id);
    NewClientMenu.dataset.id = client_id;
    NewClientMenu.classList.remove("created");

    const NewAdditionalDishes = document.querySelector(
      ".additional-dishes.created"
    );
    NewAdditionalDishes.setAttribute("data-id", client_id);
    NewAdditionalDishes.dataset.id = client_id;
    NewAdditionalDishes.classList.remove("created");

    const NewClientTotalPrice = document.querySelector(
      ".client-total-price.created"
    );
    NewClientTotalPrice.setAttribute("data-id", client_id);
    NewClientTotalPrice.dataset.id = client_id;
    NewClientTotalPrice.classList.remove("created");

    const OrderPriceCount = document.querySelector(
      ".order-price-count.created"
    );
    OrderPriceCount.text = "0";
    OrderPriceCount.setAttribute("data-id", client_id);
    OrderPriceCount.id = client_id;
    OrderPriceCount.classList.remove("created");

    const clientPriceCount = document.querySelector(
      ".client-price-count.created"
    );
    clientPriceCount.text = "0";
    clientPriceCount.setAttribute("data-id", client_id);
    clientPriceCount.id = client_id;
    clientPriceCount.classList.remove("created");

    const clientQuantity = document.querySelector(".client-quantity.created");
    clientQuantity.text = "0";
    clientQuantity.setAttribute("data-id", client_id);
    clientQuantity.id = client_id;
    clientQuantity.classList.remove("created");

    localStorage.setItem("current_client_id", client_id);
  } else if (action === "client_deleted") {
    var client_id = data["client_id"];
    var banqet_id = data["current_banquet_id"];
    const clientElement = document.querySelector(
      `.my_client[data-id="${client_id}"]`
    );
    const banqet_id_element = document.querySelector(
      `.banquet-total-price[data-id="${banqet_id}"]`
    );
    banqet_id_element.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";
    if (clientElement) {
      clientElement.remove();
    }
  } else if (action === "order_deleted") {
    var orderId = data.order_id;
    var client_id = data.client_id;
    var clientOrdersElement = document.querySelector(
      `.adittional-dish[data-id="${orderId}"]`
    );

    // Если элемент найден, удаляем его
    if (clientOrdersElement) {
      clientOrdersElement.remove();
      if (data.orders_left == "false") {
        var clientAdditional = document.querySelector(
          `.additional-dishes[data-id="${client_id}"]`
        );
        while (clientAdditional.firstChild) {
          clientAdditional.removeChild(clientAdditional.firstChild);
        }
      }
    }

    const new_OrderTotalPrice = document.querySelector(
      `span.order-price-count[data-id="${data.client_id}"]`
    );
    if (new_OrderTotalPrice) {
      new_OrderTotalPrice.textContent = data.order_total_price;
    }

    const new_client_total_price = document.querySelector(
      `span.client-price-count[data-id="${data.client_id}"]`
    );
    if (new_client_total_price) {
      new_client_total_price.textContent = formatInteger(
        parseInt(data.client_total_price)
      );
    }

    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.banqet_id}"]`
    );
    total_banquet_price.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";

    const current_client_name = localStorage.getItem("current_client_name");
    const dish_id = data["dish_id"];
    const dish_name = data["dish_name"];
    var orderButton = $("<button>", {
      class: "order-button",
      "data-id": dish_id,
      "data-name": dish_name,
    }).text(`Выбрать для "${current_client_name}"`);

    var orderButtonContainer = $(`.order-btn-container[data-id="${dish_id}"]`);
    orderButtonContainer.empty();

    orderButtonContainer.append(orderButton);

    const orderButtonToAddListener = document.querySelector(
      `.order-button[data-id="${dish_id}"]`
    );

    if (orderButtonToAddListener) {
      AddBtnAnimation(orderButtonToAddListener);
    }

    var is_addit = localStorage.getItem("is_additional");
    if (is_addit == "true") {
      orderButtonToAddListener.addEventListener("click", function () {
        handleButtonClickAddittional(this);
      });
    } else {
      orderButtonToAddListener.addEventListener("click", function () {
        handleButtonClick(this);
      });
    }

    orderButtonToAddListener.addEventListener("click", function () {
      AddBtnAnimation(this);
    });
  } else if (action === "client_quantity_changed") {
    client_id = data["client_id"];
    banquet_id = data["banquet_id"];

    const client_quantity = document.querySelector(
      `.client-quantity[data-id="${client_id}"]`
    );

    const client_price = document.querySelector(
      `.client-price-count[data-id="${data.client_id}"]`
    );
    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.banquet_id}"]`
    );

    if (client_quantity) {
      client_quantity.textContent = data["new_quantity"];
    }
    // client_quantity_two.textContent = data["new_quantity"]
    if (client_price) {
      client_price.textContent = formatInteger(
        parseInt(data["client_total_price"])
      );
    }
    total_banquet_price.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";
  } else if (action === "client_name_changed") {
    client_id = data["client_id"];
    new_name = data["new_name"];
    const client_name = document.querySelector(
      `.client-name[data-id="${client_id}"]`
    );
    if (client_name) {
      client_name.textContent = new_name;
    }

    current_client_id = localStorage.getItem("current_client_id");
    if (client_id == current_client_id) {
      const client_name_2 = document.querySelectorAll(`.client-name-2`);
      client_name_2.forEach((element) => {
        element.textContent = new_name;
      });
      const client_name_3 = document.querySelectorAll(`.client-name-3`);
      client_name_3.forEach((element) => {
        element.textContent = new_name;
      });
    }

    client_form_to_change = document.querySelector(
      `.vash_zakaz[data-id="${client_id}"]`
    );
    client_form_to_change.dataset.name = new_name;
    localStorage.setItem("current_client_name", new_name);
  } else if (action === "client_menu_deleted") {
    client_id = data["client_id"];
    menu_id = data["menu_id"];

    var MenuDivToRemove = document.querySelector(
      `.client-menu[data-id="${client_id}"]`
    );

    if (MenuDivToRemove) {
      while (MenuDivToRemove.firstChild) {
        MenuDivToRemove.removeChild(MenuDivToRemove.firstChild);
      }
    }

    const OrderTotalPrice = document.querySelector(
      `span.order-price-count[data-id="${data.client_id}"]`
    );
    if (OrderTotalPrice) {
      OrderTotalPrice.textContent = data.order_total_price;
    }

    const client_total_price = document.querySelector(
      `span.client-price-count[data-id="${data.client_id}"]`
    );
    if (client_total_price) {
      client_total_price.textContent = formatInteger(
        parseInt(data.client_total_price)
      );
    }
    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.current_banquet_id}"]`
    );
    total_banquet_price.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";
  } else if (action === "menu_added") {
    client_id = data["client_id"];
    current_menu_id = data["current_menu_id"];

    var menuToRemove = document.querySelector(
      `div.client-menu[data-id="${client_id}"]`
    );
    // Проверяем, найден ли элемент, и удаляем его, если он найден
    if (menuToRemove) {
      while (menuToRemove.firstChild) {
        menuToRemove.removeChild(menuToRemove.firstChild);
      }
    }

    var menuDiv = document.querySelector(
      `.client-menu[data-id="${client_id}"]`
    );
    if (menuDiv) {
      menuDiv.setAttribute("data-id", client_id);
    }

    // Создаем контейнер с кнопкой и заголовком
    var btnDiv = document.createElement("div");
    btnDiv.className = "client-menu-btn";

    var menuHeader = document.createElement("h1");
    menuHeader.style.display = "inline-block";
    menuHeader.textContent = "Меню" + ' "' + data["current_menu_name"] + '"';

    var deleteButton = document.createElement("button");
    deleteButton.className = "delete-menu-btn";

    deleteButton.setAttribute("data-id", current_menu_id);
    deleteButton.setAttribute("data-clientid", client_id);
    deleteButton.textContent = "Удалить";

    btnDiv.appendChild(menuHeader);
    btnDiv.appendChild(deleteButton);

    menuDiv.appendChild(btnDiv);

    // Массив с блюдами и ценами
    var totalCost = data["menu_total_price_count"];
    items = data["current_menu_dishes"];

    // Создаем элементы для каждого блюда
    i = 0;
    items.forEach(function (item) {
      var dishDiv = document.createElement("div");
      dishDiv.className = "client-menu-dish";
      // dishDiv.setAttribute("data-id", item.name);

      var dishHeader = document.createElement("h1");
      dishHeader.style.marginLeft = "25px";
      dishHeader.textContent = "-" + items[i];
      i = i + 1;
      dishDiv.appendChild(dishHeader);
      menuDiv.appendChild(dishDiv);
    });

    // Создаем элемент для общей стоимости
    var totalCostHeader = document.createElement("h1");
    totalCostHeader.style.marginLeft = "15px";
    totalCostHeader.textContent = `Итого: ${totalCost.toFixed(2)} ₽ с человека`;

    menuDiv.appendChild(totalCostHeader);

    // Добавляем разделитель

    var separator = document.createElement("div");
    separator.classList.add("dotted-line");
    menuDiv.appendChild(separator);

    var current_client_id = localStorage.getItem("current_client_id");

    var client_menu_total_price = document.querySelector(
      'span.order-price-count[data-id="' + data.client_id + '"]'
    );
    if (client_menu_total_price) {
      client_menu_total_price.textContent = totalCost;
    }

    var client_price_count = document.querySelector(
      'span.client-price-count[data-id="' + data.client_id + '"]'
    );
    if (client_price_count) {
      client_price_count.textContent = formatInteger(
        parseInt(data.client_total_price)
      );
    }

    const OrderTotalPrice = document.querySelector(
      `span.order-price-count[data-id="${data.client_id}"]`
    );
    if (OrderTotalPrice) {
      OrderTotalPrice.textContent = data.order_total_price;
    }

    const client_total_price = document.querySelector(
      `span.client-price-count[data-id="${data.client_id}"]`
    );
    if (client_total_price) {
      client_total_price.textContent = formatInteger(
        parseInt(data.client_total_price)
      );
    }

    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.current_banquet_id}"]`
    );
    total_banquet_price.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";

    function handleDeleteMenuButtonClick2(button) {
      const menu_id = button.dataset.id; // Получаем значение data-id из атрибута data-id
      var username_id = localStorage.getItem("username_id");
      var current_client_id = localStorage.getItem("current_client_id");
      socket.send(
        JSON.stringify({
          action: "client_menu_delete",
          menu_id: menu_id,
          current_user_id: username_id,
          client_id: current_client_id,
        })
      );
    }

    const menuDeleteButton = document.querySelector(
      `.delete-menu-btn[data-clientid="${client_id}"]`
    );
    menuDeleteButton.addEventListener("click", function (event) {
      handleDeleteMenuButtonClick2(event.target); // Передаем кнопку как аргумент
    });
  } else if (action === "new_additional_dish_added") {
    var dish_data = data["current_dish_data"];
    dish_data = JSON.parse(dish_data);
    var client_id = localStorage.getItem("current_client_id");
    var current_banquet_id = data["current_banquet_id"];

    const additional_dishes = document.querySelector(
      `.additional-dishes[data-banquet-id="${current_banquet_id}"]`
    );
    if (data["is_first"]) {
      var additionalDishesSign2 = `
      <div class="additional-dishes-sign">
          Выбранное дополнительно
        <button class="clear-additional-btn-additional" data-id="${current_banquet_id}">
          Очистить
        </button>
      </div>
    `;
      var temp3 = document.createElement("div");
      temp3.innerHTML += additionalDishesSign2;
      additional_dishes.append(temp3);
    }

    const client_id2 = data["client_id"];
    const order_id = data["current_dish_order_id"];
    const order_quantity = data["client_dishOrder_quantity"];

    const dish_id = dish_data["id"];
    const dish_name = dish_data["name"];
    const dish_tittle = dish_data["name"];
    const dish_weight = dish_data["weight"];
    const dish_price = dish_data["price"];
    const dish_sostav = dish_data["sostav"];
    const dish_type = dish_data["type"];
    const dish_image = dish_data["image"];
    var adittionalDish = `
    <div class="adittional-dish" data-id="${order_id}">
  <div class="adittional-dish-item-img">
    <img class="client-img" data-id="${dish_id}" data-name="${dish_name}" data-tittle="${dish_tittle}" data-weight="${dish_weight}"
     data-price="${dish_price}.00" data-sostav="${dish_sostav}" data-type="${dish_type}" 
     src="http://localhost:8000${dish_image}">
  </div>
  <div class="adittional-dish-item">
  ${dish_tittle}
    <div class="client-order-price">
      <span class="client_order_price" data-id="${client_id2}" data-order-id="${order_id}" id="${order_id}">${dish_price}</span>.00 ₽ ·
      <span class="dish-weight">${dish_weight} гр.</span>
    </div>
  </div>
  <div class="adittional-dish-item-button-additional">
      <div class="delete-btn-wrapper2-additional">
        <button class="decrease-btn-adittional" data-id="${order_id}" data-banquetid="${current_banquet_id}">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="decrease-btn-svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6 12a1 1 0 0 0 1 1h10a1 1 0 1 0 0-2H7a1 1 0 0 0-1 1Z" fill="currentColor"></path>
          </svg>
        </button>
        <input class="dish-number-input-adittional" data-id="${current_banquet_id}" data-dish-id="${order_id}" type="text" value="${order_quantity}"></input>
        <button class="increase-btn-adittional" data-id="${order_id}" data-banquetid="${current_banquet_id}">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="increase-btn-svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6a1 1 0 0 0-1 1v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7a1 1 0 0 0-1-1Z" fill="currentColor"></path>
          </svg>
        </button>
      </div>
      <button class="delete-additional-btn" data-id="${order_id}">
            <img data-id="${order_id}" class="musorka-additional" src="/static/images/trashcan.png" alt="delete">
      </button>
  </div>
  </div>
`;

    var temp = document.createElement("div");
    temp.innerHTML += adittionalDish;
    additional_dishes.append(temp);

    var additionalDishesSignBtn2 = document.querySelector(
      `.clear-additional-btn-additional[data-id="${current_banquet_id}"]`
    );

    additionalDishesSignBtn2.addEventListener(
      "click",
      handleClearBanquetAdditionalBtnClick
    );

    var decreaseBtn = document.querySelector(
      `.decrease-btn[data-id="${order_id}"]`
    );
    if (decreaseBtn) {
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

    var increaseBtn = document.querySelector(
      `.increase-btn[data-id="${order_id}"]`
    );
    if (increaseBtn) {
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
    }
  } else if (action == "new_dish_added") {
    var dish_data = data["current_dish_data"];
    dish_data = JSON.parse(dish_data);
    var client_id = localStorage.getItem("current_client_id");
    var newDiv = document.createElement("div");
    div_name = "client-orders-" + data.current_dish_order_id;
    newDiv.classList.add(div_name);

    const additional_dishes = document.querySelector(
      `.additional-dishes[data-id="${client_id}"]`
    );
    if (data["is_first"]) {
      var additionalDishesSign = `
      <div class="additional-dishes-sign">
        Выбранные отдельно блюда
        <button class="clear-additional-btn" data-id="${data["client_id"]}">
          Очистить
        </button>
      </div>
    `;
      var temp2 = document.createElement("div");
      temp2.innerHTML += additionalDishesSign;
      additional_dishes.append(temp2);
    }

    const client_id2 = data["client_id"];
    const order_id = data["current_dish_order_id"];
    const order_quantity = data["client_dishOrder_quantity"];

    const dish_id = dish_data["id"];
    const dish_name = dish_data["name"];
    const dish_tittle = dish_data["name"];
    const dish_weight = dish_data["weight"];
    const dish_price = dish_data["price"];
    const dish_sostav = dish_data["sostav"];
    const dish_type = dish_data["type"];
    const dish_image = dish_data["image"];
    var adittionalDish = `
    <div class="adittional-dish" data-id="${order_id}">
  <div class="adittional-dish-item-img">
    <img class="client-img" data-id="${dish_id}" data-name="${dish_name}" data-tittle="${dish_tittle}" data-weight="${dish_weight}"
     data-price="${dish_price}.00" data-sostav="${dish_sostav}" data-type="${dish_type}" 
     src="http://localhost:8000${dish_image}">
  </div>
  <div class="adittional-dish-item">
  ${dish_tittle}
    <div class="client-order-price">
      <span class="client_order_price" data-id="${client_id2}" data-order-id="${order_id}" id="${order_id}">${dish_price}</span>.00 ₽ ·
      <span class="dish-weight">${dish_weight} гр.</span>
    </div>
  </div>
  <div class="adittional-dish-item-button">
    <div class="delete-btn-wrapper">
      <div class="delete-btn-wrapper2">
        <button class="decrease-btn" data-id="${order_id}" data-clientid="${client_id2}">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="decrease-btn-svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6 12a1 1 0 0 0 1 1h10a1 1 0 1 0 0-2H7a1 1 0 0 0-1 1Z" fill="currentColor"></path>
          </svg>
        </button>
        <span class="dish-number-input" data-id="${order_id}" data-dish-id="${order_id}" type="text" value="">${order_quantity}</span>
        <button class="increase-btn" data-id="${order_id}" data-clientid="${client_id2}">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="increase-btn-svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6a1 1 0 0 0-1 1v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7a1 1 0 0 0-1-1Z" fill="currentColor"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
  </div>
`;

    var temp = document.createElement("div");
    temp.innerHTML += adittionalDish;
    additional_dishes.append(temp);

    var additionalDishesSignBtn = document.querySelector(
      `.clear-additional-btn[data-id="${data["client_id"]}"]`
    );

    additionalDishesSignBtn.addEventListener(
      "click",
      handleClearAdditionalBtnClick
    );

    var decreaseBtn = document.querySelector(
      `.decrease-btn[data-id="${order_id}"]`
    );
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
    var increaseBtn = document.querySelector(
      `.increase-btn[data-id="${order_id}"]`
    );
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
  } else if (action == "dish_added") {
    var newQuantity = data.client_dishOrder_quantity;
    var client_dishOrder_price_count = data.client_dishOrder_price_count;
    var current_dish_order_id = data.current_dish_order_id;

    var clientContainer = document.getElementById(data.client_id);
    if (clientContainer) {
      const clientOrderPriceElement = document.querySelector(
        `span.client_order_price[id="${current_dish_order_id}"]`
      );

      clientOrderPriceElement.textContent = data.client_dishOrder_price_count;

      const clientOrderQuantity = document.querySelector(
        `span.client_order_quantity[id="${current_dish_order_id}"]`
      );

      if (clientOrderQuantity) {
        clientOrderQuantity.textContent = newQuantity;
      }

      const clientOrderQuantity2 = document.querySelector(
        `span.dish-number-input[data-dish-id="${current_dish_order_id}"]`
      );
      if (clientOrderQuantity2) {
        clientOrderQuantity2.textContent = newQuantity;
      }
    }
  } else if (action == "menu_added_sep") {
    var client_id = localStorage.getItem("current_client_id");
    var newDiv = document.createElement("div");
    div_name = "client-orders-" + data.current_dish_order_id;
    newDiv.classList.add(div_name);

    const additional_dishes = document.querySelector(
      `.additional-dishes[data-id="${client_id}"]`
    );
  } else if (action == "additional_order_deleted") {
    var adittionalDish = document.querySelector(
      `.adittional-dish[data-id="${data["current_dish_order_id"]}"]`
    );
    if (adittionalDish) {
      adittionalDish.remove();
    }

    var orderPriceCountAdditional = document.querySelector(
      `.order-price-count-additional[data-id="${data["banqet_id"]}"`
    );
    orderPriceCountAdditional.textContent =
      data["current_banquet_additional_price"][0];
    var banquetTotalPrice = document.querySelector(
      `.banquet-total-price[data-id="${data["banqet_id"]}"]`
    );
    banquetTotalPrice.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";
  } else if (
    action == "additional_order_increased" ||
    action == "additional_order_decreased"
  ) {
    client_id = data["client_id"];
    dishOrder_id = data["current_dish_order_id"];
    new_quantity = data["new_quantity"];
    banqet_id = data["banqet_id"];
    const DishNumberInput = document.querySelector(
      `.dish-number-input[data-dish-id="${dishOrder_id}"]`
    );
    const DishNumberInput2 = document.querySelector(
      `.dish-number-input2[data-dish-id="${dishOrder_id}"]`
    );
    const clientOrderQuantity = document.getElementById(dishOrder_id);
    clientOrderQuantity.textContent = new_quantity;
    if (DishNumberInput) {
      DishNumberInput.textContent = new_quantity;
    }

    if (DishNumberInput2) {
      DishNumberInput2.textContent = new_quantity;
    }

    const dish_order_price = document.querySelector(
      `.client_order_price[data-order-id="${dishOrder_id}"]`
    );
    dish_order_price.textContent = data["current_dish_order_price_count"];

    const orderPriceCount = document.getElementById(client_id);
    orderPriceCount.textContent = data["order_total_price"];

    const clientPriceCount = document.querySelector(
      `.client-price-count[data-id="${client_id}"]`
    );
    clientPriceCount.textContent = formatInteger(
      parseInt(data["client_total_price"])
    );

    const banquetTotalPrice = document.getElementById(banqet_id);
    banquetTotalPrice.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";

    const dishNumberInput2 = document.querySelector(
      `.dish-number-input2[data-dish-id="${dishOrder_id}"]`
    );
    if (dishNumberInput2) {
      dishNumberInput2.textContent = new_quantity;
    }
  } else if (action == "client_additional_cleared") {
    const additionalDishes = document.querySelector(
      `.additional-dishes[data-id="${data["client_id"]}"]`
    );
    if (additionalDishes) {
      while (additionalDishes.firstChild) {
        additionalDishes.removeChild(additionalDishes.firstChild);
      }
    }
  } else if (action == "banquet_additional_cleared") {
    const additionalDishes = document.querySelector(
      `.additional-dishes[data-banquet-id="${data["banqet_id"]}"]`
    );
    if (additionalDishes) {
      while (additionalDishes.firstChild) {
        additionalDishes.removeChild(additionalDishes.firstChild);
      }
    }
  } else if (
    action == "additional_order_increased_additional" ||
    action == "additional_order_decreased_additional"
  ) {
    var current_dish_order_id = data["current_dish_order_id"];
    var dishNumberInputAdittional = document.querySelector(
      `input.dish-number-input-adittional[data-dish-id="${current_dish_order_id}"]`
    );
    if (dishNumberInputAdittional) {
      dishNumberInputAdittional.value = data["new_quantity"];
    }
    var dishNumberInputAdittional2 = document.querySelector(
      `span.dish-number-input2[data-dish-id="${current_dish_order_id}"]`
    );
    var dishNumberInputAdittional2Additional = document.querySelector(
      `input.dish-number-input2-additional[data-dish-id="${current_dish_order_id}"]`
    );
    if (dishNumberInputAdittional2) {
      dishNumberInputAdittional2.textContent = data["new_quantity"];
    }
    if (dishNumberInputAdittional2Additional) {
      dishNumberInputAdittional2Additional.value = data["new_quantity"];
    }
  }

  if (
    action == "dish_added" ||
    action == "new_dish_added" ||
    action == "new_additional_dish_added" ||
    action == "recalc_after_changing"
  ) {
    const OrderTotalPrice = document.querySelector(
      `span.order-price-count[data-id="${data.client_id}"]`
    );

    if (OrderTotalPrice) {
      OrderTotalPrice.textContent = data.order_total_price;
    }

    const order_total_price = document.querySelector(
      `span.order-price-count[data-id="${data.client_id}"]`
    );

    if (order_total_price) {
      order_total_price.textContent = data.order_total_price;
    }

    const client_price_count = document.querySelector(
      `span.client-price-count[data-id="${data.client_id}"]`
    );
    if (client_price_count) {
      client_price_count.textContent = formatInteger(
        parseInt(data.client_total_price)
      );
    }

    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.current_banquet_id}"]`
    );
    total_banquet_price.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";

    const current_dish_id = data["current_dish_id"];
    orderButtonToDelete = document.querySelector(
      `.order-button[data-id="${current_dish_id}"]`
    );
    if (orderButtonToDelete) {
      orderButtonToDelete.remove();
    }

    const container = document.querySelector(
      `.order-btn-container[data-id="${current_dish_id}"]`
    );
    CreateQuantityStatusButton(
      container,
      data.client_id,
      data.current_dish_order_id,
      1
    );
  }
};

socket.onclose = function () {
  console.log("BanquetEditingSocket соединение закрыто. Переподключение...");
};

// JavaScript код для отображения/скрытия формы при нажатии на кнопку
const showFormButton = document.getElementById("showFormBtn");
const clientForm = document.getElementById("clientForm");
const cancelFormButton = document.getElementById("cancelFormBtn");

showFormButton.addEventListener("click", () => {
  showFormButton.remove();
  // Создаем основной div элемент
  const divElement = document.createElement("div");
  divElement.className = "my_client formaClienta menu-client-btn";
  divElement.classList.add("created");
  divElement.setAttribute("data-name", "Выберите клиента");
  localStorage.setItem("current_client_name", "Выберите клиента");
  // Создаем div для header
  const headerDiv = document.createElement("div");
  headerDiv.className = "formaClienta_header";

  // Создаем input для имени
  const nameInput = document.createElement("input");
  nameInput.className = "name-input";
  nameInput.value = "Введите клиента";
  nameInput.classList.add("created");
  nameInput.addEventListener("change", function () {
    const client_id = $(this).data("id");
    var currentValue = $(this).val();
    // Проверяем длину введенного текста
    if (currentValue.length > 15) {
      // Если длина больше максимальной, обрезаем текст до максимальной длины
      $(this).val(currentValue.slice(0, 15));
    }
    if (currentValue.length == 0) {
      // Если длина больше максимальной, обрезаем текст до максимальной длины
      $(this).val("Введите клиента");
    }
    const name = $(this).val();
    username_id = localStorage.getItem("username_id");
    socket.send(
      JSON.stringify({
        action: "client_name_update",
        client_id: client_id,
        current_user_id: username_id,
        name: name,
      })
    );
  });

  nameInput.addEventListener("input", function () {
    const client_id = $(this).data("id");
    var currentValue = $(this).val();
    // Проверяем длину введенного текста
    if (currentValue.length > 15) {
      // Если длина больше максимальной, обрезаем текст до максимальной длины
      $(this).val(currentValue.slice(0, 15));
    }

    const name = $(this).val();
    username_id = localStorage.getItem("username_id");
    socket.send(
      JSON.stringify({
        action: "client_name_update",
        client_id: client_id,
        current_user_id: username_id,
        name: name,
      })
    );
  });

  const pElement = document.createElement("p");
  pElement.style.fontSize = "10px";
  pElement.style.display = "inline";
  pElement.style.color = "#fff";
  pElement.style.marginBottom = "12px";
  pElement.textContent = "x";

  const quantityInput = document.createElement("input");
  quantityInput.className = "quantity-input";
  quantityInput.value = "0";
  quantityInput.classList.add("created");

  quantityInput.addEventListener("input", function () {
    const client_id = $(this).data("id");
    var currentValue = $(this).val();
    var all_clients = document.querySelectorAll(".quantity-input");
    // Удаление всех символов, кроме цифр
    currentValue = currentValue.replace(/\D/g, "");

    var sum = 0;
    all_clients.forEach(function (input) {
      sum += parseInt(input.value);
    });

    if (sum > 2000) {
      currentValue = 2000 - (sum - parseInt(currentValue));
    }
    // Проверяем длину введенного текста
    if (currentValue.length > 4) {
      // Если длина больше максимальной, обрезаем текст до максимальной длины
      currentValue = 2000;
    }

    const quantity = Math.min(2000, Math.max(0, currentValue)); // Ограничиваем значение до 2000
    $(this).val(quantity); // Обновляем значение поля ввода
    updateQuantity(client_id, quantity);
  });

  // Создаем кнопку для удаления клиента
  const deleteClientButton = document.createElement("button");
  deleteClientButton.className = "delete-client-btn";
  deleteClientButton.classList.add("created");
  // Создаем изображение внутри кнопки
  const deleteImage = document.createElement("img");
  deleteImage.className = "musorka";
  deleteImage.src = "/static/images/Мусорка.png";
  deleteImage.alt = "delete";
  deleteImage.classList.add("created");

  // Добавляем элементы в иерархию
  deleteClientButton.appendChild(deleteImage);
  headerDiv.appendChild(nameInput);
  headerDiv.appendChild(pElement);
  headerDiv.appendChild(quantityInput);
  headerDiv.appendChild(deleteClientButton);
  divElement.appendChild(headerDiv);

  const vashZakazDiv = document.createElement("div");
  vashZakazDiv.className = "vash_zakaz";
  vashZakazDiv.classList.add("created");
  divElement.appendChild(vashZakazDiv); // Пустой div для vash_zakaz

  const client_menu = document.createElement("div");
  client_menu.className = "client-menu";
  client_menu.classList.add("created");
  vashZakazDiv.appendChild(client_menu);

  const additional_dishes = document.createElement("div");
  additional_dishes.className = "additional-dishes";
  additional_dishes.classList.add("created");
  vashZakazDiv.appendChild(additional_dishes);

  const client_total_price = document.createElement("div");
  client_total_price.className = "client-total-price";
  client_total_price.classList.add("created");
  var ClientTotalPrice = `Итого:
              <span class="order-price-count created">0</span>.00 ₽ x
              <span class="client-quantity created">0</span> человек =
              <span class="client-price-count created">0</span>.00 ₽`;

  client_total_price.innerHTML = ClientTotalPrice;
  vashZakazDiv.appendChild(client_total_price);

  var buttonDetails = document.createElement("button");
  buttonDetails.className = "details-button";
  buttonDetails.classList.add("created");
  buttonDetails.textContent = "Меню";

  divElement.appendChild(buttonDetails);
  // Добавляем созданный элемент в DOM
  const container = document.getElementById("all_clients"); // Замените "container" на ID родительского контейнера, куда вы хотите добавить элемент
  container.appendChild(divElement);

  const showFormButton2 = document.createElement("button");
  showFormButton2.id = "showFormBtn";
  showFormButton2.className = "formaClienta";
  showFormButton2.textContent = "+";
  showFormButton2.addEventListener("click", () => {
    showFormButton2.remove();
    // Создаем основной div элемент
    const divElement = document.createElement("div");
    divElement.className = "my_client formaClienta menu-client-btn";
    divElement.classList.add("created");
    divElement.setAttribute("data-name", "Выберите клиента");
    localStorage.setItem("current_client_name", "Выберите клиента");
    // Создаем div для header
    const headerDiv = document.createElement("div");
    headerDiv.className = "formaClienta_header";

    // Создаем input для имени
    const nameInput = document.createElement("input");
    nameInput.className = "name-input";
    nameInput.value = "Введите клиента";
    nameInput.classList.add("created");
    nameInput.addEventListener("input", function () {
      const client_id = $(this).data("id");
      const name = $(this).val();
      username_id = localStorage.getItem("username_id");
      socket.send(
        JSON.stringify({
          action: "client_name_update",
          client_id: client_id,
          current_user_id: username_id,
          name: name,
        })
      );
    });
    // Создаем элемент p
    const pElement = document.createElement("p");
    pElement.style.fontSize = "10px";
    pElement.style.display = "inline";
    pElement.style.color = "#fff";
    pElement.style.marginBottom = "12px";
    pElement.textContent = "x";

    // Создаем input для количества
    const quantityInput = document.createElement("input");
    quantityInput.className = "quantity-input";
    quantityInput.value = "1";
    quantityInput.classList.add("created");
    quantityInput.setAttribute("pattern", "[A-Za-z]{3}");

    quantityInput.addEventListener("input", function () {
      const client_id = $(this).data("id");
      const quantity = Math.max(1, $(this).val()); // Ensure the quantity is not less than 1
      updateQuantity(client_id, quantity);
    });

    // Создаем кнопку для удаления клиента
    const deleteClientButton = document.createElement("button");
    deleteClientButton.className = "delete-client-btn";
    deleteClientButton.classList.add("created");
    // Создаем изображение внутри кнопки
    const deleteImage = document.createElement("img");
    deleteImage.className = "musorka";
    deleteImage.src = "/static/images/Мусорка.png";
    deleteImage.alt = "delete";
    deleteImage.classList.add("created");

    // Добавляем элементы в иерархию
    deleteClientButton.appendChild(deleteImage);
    headerDiv.appendChild(nameInput);
    headerDiv.appendChild(pElement);
    headerDiv.appendChild(quantityInput);
    headerDiv.appendChild(deleteClientButton);
    divElement.appendChild(headerDiv);

    const vashZakazDiv = document.createElement("div");
    vashZakazDiv.className = "vash_zakaz";
    vashZakazDiv.classList.add("created");

    vashZakazDiv.appendChild(ClientTotalPrice);
    divElement.appendChild(vashZakazDiv);
    const container = document.getElementById("all_clients");
    container.appendChild(divElement);

    const showFormButton2 = document.createElement("button");
    showFormButton2.id = "showFormBtn";
    showFormButton2.className = "formaClienta";
    showFormButton2.textContent = "+";
    showFormButton2.addEventListener;
    container.appendChild(showFormButton);
    username_id = localStorage.getItem("username_id");
    socket.send(
      JSON.stringify({
        action: "added_client",
        clientName: "Введите клиента",
        clientCount: 0,
        current_user_id: username_id,
      })
    );
  });
  container.appendChild(showFormButton);
  username_id = localStorage.getItem("username_id");
  socket.send(
    JSON.stringify({
      action: "added_client",
      clientName: "Введите клиента",
      clientCount: 0,
      current_user_id: username_id,
    })
  );
});

$(".quantity-input").on("input", function () {
  const client_id = $(this).data("id");
  var currentValue = $(this).val();
  var all_clients = document.querySelectorAll(".quantity-input");
  // Удаление всех символов, кроме цифр
  currentValue = currentValue.replace(/\D/g, "");

  var sum = 0;
  all_clients.forEach(function (input) {
    sum += parseInt(input.value);
  });

  if (sum > 3500) {
    currentValue = 3500 - (sum - parseInt(currentValue));
  }

  // Проверяем длину введенного текста
  if (currentValue.length > 4) {
    // Если длина больше максимальной, обрезаем текст до максимальной длины
    currentValue = 3500;
  }

  const quantity = Math.min(3500, Math.max(0, currentValue)); // Ограничиваем значение до 2000
  $(this).val(quantity); // Обновляем значение поля ввода
  updateQuantity(client_id, quantity);
});

$(".name-input").on("input", function () {
  const client_id = $(this).data("id");
  var currentValue = $(this).val();
  $(this).val = currentValue.trim();
  // Проверяем длину введенного текста
  if (currentValue.length > 15) {
    // Если длина больше максимальной, обрезаем текст до максимальной длины
    $(this).val(currentValue.slice(0, 15));
  }
  const name = $(this).val();
  username_id = localStorage.getItem("username_id");
  socket.send(
    JSON.stringify({
      action: "client_name_update",
      client_id: client_id,
      current_user_id: username_id,
      name: name,
    })
  );
});

$(".name-input").on("change", function () {
  var currentValue = $(this).val();
  const client_id = $(this).data("id");

  if (currentValue.length == 0) {
    $(this).val("Введите клиента");
    const name = $(this).val();

    username_id = localStorage.getItem("username_id");
    $(this).val = currentValue.trim();
    socket.send(
      JSON.stringify({
        action: "client_name_update",
        client_id: client_id,
        current_user_id: username_id,
        name: name,
      })
    );
  }
});

const deleteMenuButtons = document.querySelectorAll(".delete-menu-btn");
deleteMenuButtons.forEach((button) => {
  button.addEventListener("click", handleDeleteMenuButtonClick);
});

const orderButtons = document.querySelectorAll(".order-button");
var client_id = localStorage.getItem("current_client_id");

orderButtons.forEach((button) => {
  if (button.innerText === "Выберите клиента") {
    button.disabled = true;
  }
  const dishId = button.dataset.id;
  const dishTittle = button.dataset.name;
  if (client_id != "") {
    button.addEventListener("click", function () {
      var username_id = localStorage.getItem("username_id");
      var client_id = localStorage.getItem("current_client_id");
      const data_to_send = {
        action: "added_dish",
        message: `Заказ "${dishTittle}" добавлен`,
        current_dish_id: dishId,
        current_user_id: username_id,
        current_client_id: client_id,
      };
      var currentUrl = window.location.href;
      const urlObject = new URL(currentUrl);
      dish_filter = urlObject.searchParams.get("dish-filter");
      var is_menu = false;
      if (dish_filter == "samples") {
        is_menu = true;
      }
      if (is_menu) {
        const new_data_to_send = {
          action: "menu_add",
          message: `Заказ "${button.dataset.name}" добавлен`,
          current_menu_id: button.dataset.id,
          current_user_id: username_id,
          current_client_id: client_id,
        };
        socket.send(JSON.stringify(new_data_to_send));
      } else {
        socket.send(JSON.stringify(data_to_send));
      }
    });
  }
});

const OrderDeleteButtons = document.querySelectorAll(".delete-btn");
OrderDeleteButtons.forEach(function (button) {
  button.addEventListener("click", handleDeleteDishButtonClick);
});

var current_dish_filter = localStorage.getItem("dish-filter");
var buttonToHighlight = $(
  'button.dish-filter[data-filter="' + current_dish_filter + '"]'
);

buttonToHighlight.addClass("highlighted");

const deleteButtons = document.querySelectorAll(".delete-client-btn");

deleteButtons.forEach((button) => {
  button.addEventListener("click", handleDeleteClientButtonClick);
});

const increaseButtons = document.querySelectorAll(".increase-btn");
const decreaseButtons = document.querySelectorAll(".decrease-btn");
const current_user_id = localStorage.getItem("username_id");
increaseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const order_id = button.dataset.id;
    const client_id = button.dataset.clientid;
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
});
decreaseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const order_id = button.dataset.id;
    const client_id = button.dataset.clientid;
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
});

const client_imges = document.querySelectorAll(".client-img");
var x, y;
for (let i = 0; i < client_imges.length; i++) {
  var div = `<div class = "overflow3 hidden" id="${
    "overflow3" + client_imges[i].getAttribute("data-id")
  }"></div>
      <div class="modWind3 hidden" id="${
        "modWind3" + client_imges[i].getAttribute("data-id")
      }">
        <div class="flex-mod-dish"><img class="dish-img-mod"
        src="http://localhost:8000/media/menu_images/${client_imges[
          i
        ].getAttribute("data-type")}/${client_imges[i].getAttribute(
    "data-tittle"
  )}.png"
        </div>
        <div class="mod-dish-info3">
          <div class="name">${client_imges[i].getAttribute("data-name")}</div>
          <div class="grams">${client_imges[i].getAttribute(
            "data-weight"
          )} гр</div>
          <div class="price">${client_imges[i].getAttribute(
            "data-price"
          )} руб</div>
          <div class="sostav">${client_imges[i].getAttribute(
            "data-sostav"
          )}</div>
        </div>
    </div>
    <div class="mod-dish-decription">
    <div class="decription">Тут будет описание...</div> 
    
    </div>
    `;

  document.querySelector("body").insertAdjacentHTML("beforeend", div);

  client_imges[i].addEventListener("click", () => {
    client_imges[i].classList.add("active");
    x = document.getElementById(
      "overflow3" + client_imges[i].getAttribute("data-id")
    );
    y = document.getElementById(
      "modWind3" + client_imges[i].getAttribute("data-id")
    );

    x.classList.remove("hidden");
    y.classList.remove("hidden");

    // my_client = document.querySelector(`.my_client[data-id="${client_imges[i].}"]`)
  });

  var exit = document.getElementById(
    "overflow3" + client_imges[i].getAttribute("data-id")
  );

  exit.addEventListener("click", () => {
    const current_dish = document.querySelector(`.client-img.active`);
    if (current_dish) {
      current_dish.classList.remove("active");
    }

    x = document.getElementById(
      "overflow3" + client_imges[i].getAttribute("data-id")
    );
    y = document.getElementById(
      "modWind3" + client_imges[i].getAttribute("data-id")
    );
    x.classList.add("hidden");
    y.classList.add("hidden");
  });

  document.addEventListener("keydown", (e) => {
    if (e.code == "Escape") {
      x.classList.add("hidden");
      y.classList.add("hidden");
    }
  });
}

const dish_search = document.getElementById(`dish-search`);

if (dish_search) {
  dish_search.addEventListener("input", function () {
    var currentValue = $(this).val();

    if (currentValue.length > 25) {
      $(this).val(currentValue.slice(0, 25));
    }

    var name = $(this).val();
    var dish_filter = localStorage.getItem("dish-filter");
    LoadMenu(dish_filter, name);
  });
}

function handleClearAdditionalBtnClick(event) {
  const client_id = event.target.dataset.id;
  username_id = localStorage.getItem("username_id");
  socket.send(
    JSON.stringify({
      action: "client_additional_clear",
      client_id: client_id,
      current_user_id: username_id,
    })
  );
}
const ClearAdditionalBtns = document.querySelectorAll(`.clear-additional-btn`);
ClearAdditionalBtns.forEach((button) => {
  button.addEventListener("click", handleClearAdditionalBtnClick);
});

banquetAdditionalDish = document.querySelector(`.banquet-additional-dish`);
if (banquetAdditionalDish) {
  banquetAdditionalDish.addEventListener("click", function () {
    banquetAdditionalDishes = document.querySelector(
      `.banquet-additional-dishes`
    );
    banquetAdditionalDishes.style.display = "none";
    // banquetAdditionalDish.remove();
  });
}

function handleClearBanquetAdditionalBtnClick(event) {
  const banquet_id = event.target.dataset.id;
  username_id = localStorage.getItem("username_id");
  socket.send(
    JSON.stringify({
      action: "banquet_additional_clear",
      banquet_id: banquet_id,
      current_user_id: username_id,
    })
  );
}
const ClearAdditionalBtn = document.querySelector(
  `.clear-additional-btn-additional`
);

if (ClearAdditionalBtn) {
  ClearAdditionalBtn.addEventListener(
    "click",
    handleClearBanquetAdditionalBtnClick
  );
}

var dishNumberInputsAittional = document.querySelectorAll(
  `.dish-number-input-adittional`
);

dishNumberInputsAittional.forEach((input) => {
  input.addEventListener("input", function () {
    const current_user_id = localStorage.getItem("username_id");
    var currentValue = $(this).val();
    var order_id = input.getAttribute("data-dish-id");
    // Удаление всех символов, кроме цифр
    currentValue = currentValue.replace(/\D/g, "");

    // Проверяем длину введенного текста
    if (currentValue.length > 4) {
      // Если длина больше максимальной, обрезаем текст до максимальной длины
      currentValue = 3500;
    }

    const quantity = Math.min(3500, Math.max(0, currentValue)); // Ограничиваем значение до 2000
    $(this).val(quantity); // Обновляем значение поля ввода

    socket.send(
      JSON.stringify({
        action: "additional_order_quantity_change",
        current_user_id: current_user_id,
        new_quantity: quantity,
        order_id: order_id,
      })
    );
  });
});

var is_addit__ = localStorage.getItem("is_additional");
var action = "additional_order_increase";
var action2 = "additional_order_decrease";
if (is_addit__ == "true") {
  var action = "additional_order_increase_additional";
  var action2 = "additional_order_decrease_additional";
}

var increaseAdittionalBtns = document.querySelectorAll(
  `.increase-btn-adittional`
);
increaseAdittionalBtns.forEach((increaseBtn) => {
  increaseBtn.addEventListener("click", () => {
    const order_id = increaseBtn.dataset.id;
    const client_id = increaseBtn.dataset.clientid;

    const dishNumberInputAdittional = document.querySelector(
      `.dish-number-input-adittional[data-dish-id="${order_id}"]`
    );
    if (dishNumberInputAdittional.value >= 3500) {
      dishNumberInputAdittional.textContent = 3500;
    } else {
      socket.send(
        JSON.stringify({
          action: "additional_order_increase_additional",
          order_id: order_id,
          client_id: client_id,
          current_client_id: client_id,
          current_user_id: current_user_id,
        })
      );
    }
  });
});

var decreaseAdittionalBtns = document.querySelectorAll(
  `.decrease-btn-adittional`
);
decreaseAdittionalBtns.forEach((decreaseBtn) => {
  decreaseBtn.addEventListener("click", () => {
    const order_id = decreaseBtn.dataset.id;
    const client_id = decreaseBtn.dataset.clientid;
    socket.send(
      JSON.stringify({
        action: "additional_order_decrease_additional",
        order_id: order_id,
        client_id: client_id,
        current_client_id: client_id,
        current_user_id: current_user_id,
      })
    );
  });
});

deleteAdditionalBtns = document.querySelectorAll(`.delete-additional-btn`);

if (deleteAdditionalBtns) {
  deleteAdditionalBtns.forEach((deleteAdditionalBtn) => {
    deleteAdditionalBtn.addEventListener("click", () => {
      const order_id = deleteAdditionalBtn.dataset.id;
      socket.send(
        JSON.stringify({
          action: "additional_order_delete",
          order_id: order_id,
          current_user_id: current_user_id,
        })
      );
    });
  });
}

function formatInteger(integer) {
  if (typeof integer === "number" && Number.isInteger(integer)) {
    const integerStr = integer.toLocaleString("en-US"); // Преобразование числа в строку с разделением тысяч
    const parts = integerStr.split(",");

    // Разделение на разряды
    let formattedInteger = "";
    while (parts.length > 0) {
      if (formattedInteger.length > 0) {
        formattedInteger = " " + formattedInteger;
      }
      formattedInteger = parts[parts.length - 1] + formattedInteger;
      parts.pop();
    }

    return formattedInteger;
  } else {
    return "Invalid input";
  }
}

var client_order_prices = document.querySelectorAll(`.client_order_price`);
if (client_order_prices) {
  client_order_prices.forEach((client_order_price) => {
    client_order_price.textContent = formatInteger(
      parseInt(client_order_price.textContent)
    );
  });
}

var orderPriceCountAdditional = document.querySelector(
  `.order-price-count-additional`
);
if (orderPriceCountAdditional) {
  orderPriceCountAdditional.textContent = formatInteger(
    parseInt(orderPriceCountAdditional.textContent)
  );
}
