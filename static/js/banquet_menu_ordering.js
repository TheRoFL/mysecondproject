// Код JavaScript для обработки WebSocket-соединения и уведомлений
let MySocket;

function initWebSocket() {
  MySocket = new ReconnectingWebSocket(
    "ws://" + window.location.host + "/ws/BanquetEditingSocket/"
  );

  MySocket.onopen = function () {
    console.log("Сокет для редактирования при нажатии на Заказать");
  };

  MySocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    console.log(data);
    if (data.action == "new_dish_added") {
      var newDiv = document.createElement("div");
      div_name = "client-orders-" + data.current_dish_order_id;
      newDiv.classList.add(div_name);

      // Формируем содержимое для нового div
      var client_dishOrderElement = document.createElement("div");
      var client_dishOrder_product_name = data.current_dish_order_name;
      var client_dishOrder_quantity = data.client_dishOrder_quantity;
      var client_dishOrder_price_count = data.client_dishOrder_price_count;
      client_dishOrderElement.classList.add("client_dishOrder-element");
      client_dishOrderElement.dataset.id = data.current_dish_order_id;
      client_dishOrderElement.innerHTML = `
      <h2 style="margin-left: 30px">
      ${client_dishOrder_product_name} x <span class="client_order_quantity" data-id="${data.client_id}" 
      id="${data.current_dish_order_id}">
      ${client_dishOrder_quantity}</span> шт. =
       <span class="client_order_price" data-id="${data.client_id}" id="${data.current_dish_order_id}">
        ${client_dishOrder_price_count}</span>.00 руб.
      </h2>
    `;
      // Создаем кнопку для удаления
      var deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-btn");
      deleteButton.dataset.id = data.current_dish_order_id;
      deleteButton.dataset.clientid = data.client_id;
      deleteButton.innerText = "X";

      // Добавляем кнопку удаления в div
      newDiv.appendChild(client_dishOrderElement);
      newDiv.appendChild(deleteButton);
      var current_client = data.client_id;
      var div_name = "client-container-" + current_client;
      document.getElementById(div_name).appendChild(newDiv);

      var OrderdeleteButtons = document.querySelectorAll(".delete-btn");
      OrderdeleteButtons.forEach(function (button) {
        button.addEventListener("click", handleDeleteDishButtonClick);
      });
    } else if (data.action == "dish_added") {
      var dataId = data.current_dish_order_id;
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

        clientOrderQuantity.textContent = newQuantity;
      }
    }

    if (data.action == "dish_added" || data.action == "new_dish_added") {
      const OrderTotalPrice = document.querySelector(
        `span.order-price-count[data-id="${data.client_id}"]`
      );

      OrderTotalPrice.textContent = data.order_total_price;

      const client_total_price = document.querySelector(
        `span.client-price-count[data-id="${data.client_id}"]`
      );

      client_total_price.textContent = data.client_total_price;

      const total_banquet_price = document.querySelector(
        `.banquet-total-price[data-id="${data.current_banquet_id}"]`
      );
      total_banquet_price.textContent =
        data["total_banquet_price"] + ".00 руб.";
    }
  };

  MySocket.onclose = function () {
    console.log("WebSocket соединение закрыто. Переподключение...");
  };
}

//обработчики нажатия кнопок 'заказать'
const orderButtons = document.querySelectorAll(".order-button");
var clientId = localStorage.getItem("current_client_id");

orderButtons.forEach((button) => {
  if (button.innerText === "Выберите клиента") {
    button.disabled = true;
  }
  const dishId = button.dataset.id;
  const dishTittle = button.dataset.name;
  if (clientId != "") {
    button.addEventListener("click", function () {
      var username_id = localStorage.getItem("username_id");
      var clientId = localStorage.getItem("current_client_id");
      const data_to_send = {
        action: "added_dish",
        message: `Заказ "${dishTittle}" добавлен`,
        current_dish_id: dishId,
        current_user_id: username_id,
        current_client_id: clientId,
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
          current_client_id: clientId,
        };
        MySocket.send(JSON.stringify(new_data_to_send));
      } else {
        MySocket.send(JSON.stringify(data_to_send));
      }
    });
  }
});

function handleDeleteDishButtonClick(event) {
  const mybutton = event.target; // Получаем элемент, на котором произошло событие (в данном случае, кнопка)
  const order_id = mybutton.dataset.id; // Получаем значение data-id из атрибута data-id
  current_client_id = mybutton.dataset.clientid;
  var username_id = localStorage.getItem("username_id");

  socket.send(
    JSON.stringify({
      action: "dish_order_delete",
      order_id: order_id,
      current_user_id: username_id,
      clientId: current_client_id,
    })
  );
  var orderElement = document.querySelector(
    `div.client-orders[data-id="${order_id}"]`
  );

  // Если элемент найден, удаляем его
  if (orderElement) {
    orderElement.remove();
    mybutton.remove();
  }
}
var OrderdeleteButtons = document.querySelectorAll(".delete-btn");
OrderdeleteButtons.forEach(function (button) {
  button.addEventListener("click", handleDeleteDishButtonClick);
});

initWebSocket();
