function updateClientsList(data) {
  type = data.type;
  quantity = data.quantity;
  client_id = data.client_id;
  var clientsHtml = "";

  clientsHtml +=
    '<input class="name-input" data-id="' +
    client_id +
    '" value="' +
    type +
    '" /> в количестве <input class="quantity-input" data-id="' +
    client_id +
    '" value="' +
    quantity +
    '" />' +
    " человек";

  $(".my_extra_clients").append(clientsHtml);
  const scrollTop =
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;
  location.reload();
  window.scrollTo(0, scrollTop);
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
  } else if (action === "client_deleted") {
    var clientId = data["client_id"];
    const clientElement = document.querySelector(
      `.my_client[data-id="${clientId}"]`
    );

    if (clientElement) {
      clientElement.remove();
      const scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      location.reload();
      window.scrollTo(0, scrollTop);
    }
  } else if (action === "order_deleted") {
    orderId = data.order_id;
    to_delete = ".client-orders-" + orderId;
    var clientOrdersElement = document.querySelector(to_delete);

    // Если элемент найден, удаляем его
    if (clientOrdersElement) {
      clientOrdersElement.remove();
    }

    const new_OrderTotalPrice = document.querySelector(
      `span.order-price-count[data-id="${data.clientId}"]`
    );
    new_OrderTotalPrice.textContent = data.order_total_price;

    const new_client_total_price = document.querySelector(
      `span.client-price-count[data-id="${data.clientId}"]`
    );
    new_client_total_price.textContent = data.client_total_price;

    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.banqet_id}"]`
    );
    total_banquet_price.textContent = data["total_banquet_price"] + ".00 руб.";
  } else if (action === "client_quantity_changed") {
    clientId = data["client_id"];
    banquet_id = data["banquet_id"];
    const client_quantity = document.querySelector(
      `.client-quantity[data-id="${clientId}"]`
    );
    const client_quantity_two = document.querySelector(
      `.client-quantity-2[data-id="${clientId}"]`
    );

    const client_price = document.querySelector(
      `.client-price-count[data-id="${data.client_id}"]`
    );
    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.banquet_id}"]`
    );

    client_quantity.textContent = data["new_quantity"];
    client_quantity_two.textContent = data["new_quantity"];
    client_price.textContent = data["client_total_price"];
    total_banquet_price.textContent = data["total_banquet_price"] + ".00 руб.";
  } else if (action === "client_name_changed") {
    clientId = data["client_id"];
    new_name = data["new_name"];
    const client_name = document.querySelector(
      `.client-name[data-id="${clientId}"]`
    );
    client_name.textContent = new_name;

    current_client_id = localStorage.getItem("current_client_id");
    if (clientId == current_client_id) {
      const client_name_2 = document.querySelectorAll(`.client-name-2`);
      client_name_2.forEach((element) => {
        element.textContent = new_name;
      });
      const client_name_3 = document.querySelectorAll(`.client-name-3`);
      client_name_3.forEach((element) => {
        element.textContent = new_name;
      });
    }
  } else if (action === "client_menu_deleted") {
    client_id = data["client_id"];
    menu_id = data["menu_id"];

    var MenuDivToRemove = document.querySelectorAll(
      'div[data-id="' + client_id + "-" + menu_id + '"]'
    );

    // Перебираем найденные элементы и удаляем каждый из них
    MenuDivToRemove.forEach(function (element) {
      element.parentNode.removeChild(element);
    });

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
    total_banquet_price.textContent = data["total_banquet_price"] + ".00 руб.";
  } else if (action === "menu_added") {
    client_id = data["client_id"];
    previous_menu_id = data["previous_menu_id"];
    current_menu_id = data["current_menu_id"];
    // Перебираем найденные элементы и удаляем следующий элемент (menuDiv)
    var targetDataId = client_id + "-" + previous_menu_id; // Здесь укажите нужное значение data-id

    var menuToRemove = document.querySelector(
      `div.client-menu[data-id="${targetDataId}"]`
    );
    // Проверяем, найден ли элемент, и удаляем его, если он найден
    if (menuToRemove) {
      menuToRemove.remove();
    }

    // Создаем основной контейнер div
    var menuDiv = document.createElement("div");
    menuDiv.className = "client-menu";
    data_id = client_id + "-" + current_menu_id;
    menuDiv.setAttribute("data-id", data_id);

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
    deleteButton.style.marginTop = "0px";
    deleteButton.style.marginLeft = "18px";
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
    totalCostHeader.textContent = `Итого: ${totalCost.toFixed(
      2
    )} руб. с человека`;

    menuDiv.appendChild(totalCostHeader);

    // Добавляем разделитель
    var separator = document.createElement("h1");
    separator.textContent =
      "--------------------------------------------------------";
    menuDiv.appendChild(separator);

    // Добавляем контейнер на страницу
    // Получаем элемент, после которого хотим вставить меню
    var targetHeaders = document.querySelectorAll(
      `h1.client-info-h1[data-id="${client_id}"]`
    );

    // Вставляем menuDiv после referenceDiv
    targetHeaders.forEach(function (header) {
      header.insertAdjacentElement("afterend", menuDiv.cloneNode(true));
    });

    var OrderdeleteButtons = document.querySelectorAll(".delete-menu-btn");

    // Перебираем найденные кнопки и добавляем к каждой обработчик события
    OrderdeleteButtons.forEach(function (button) {
      button.addEventListener("click", handleDeleteDishButtonClick);
    });

    // Определение функции обработчика события
    function handleDeleteDishButtonClick(event) {
      // Получаем данные из атрибутов кнопки
      const menu_id = event.target.getAttribute("data-id");
      var username_id = localStorage.getItem("username_id");
      var current_client_id = event.target.getAttribute("data-clientid");

      // Выполняем необходимые действия с полученными данными
      socket.send(
        JSON.stringify({
          action: "client_menu_delete",
          menu_id: menu_id,
          current_user_id: username_id,
          client_id: current_client_id,
        })
      );
    }

    // Находим элемент <span> с соответствующим data-id
    var client_menu_total_price = document.querySelector(
      'span.order-price-count[data-id="' + data.client_id + '"]'
    );
    client_menu_total_price.textContent = totalCost;

    var client_price_count = document.querySelector(
      'span.client-price-count[data-id="' + data.client_id + '"]'
    );
    client_price_count.textContent = data.client_total_price;

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
    total_banquet_price.textContent = data["total_banquet_price"] + ".00 руб.";
  } else if (action == "new_dish_added") {
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
  } else if (action == "dish_added") {
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

  if (action == "dish_added" || action == "new_dish_added") {
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
    total_banquet_price.textContent = data["total_banquet_price"] + ".00 руб.";
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
  clientForm.style.display = "block";
  showFormButton.style.display = "none";
});

cancelFormButton.addEventListener("click", () => {
  clientForm.style.display = "none";
  showFormButton.style.display = "block";

  document.getElementById("clientName").value = null;
  document.getElementById("clientCount").value = null;
});

clientForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const clientName = document.getElementById("clientName").value;
  const clientCount = document.getElementById("clientCount").value;

  showFormButton.style.display = "block";
  clientForm.style.display = "none";

  document.getElementById("clientName").value = null;
  document.getElementById("clientCount").value = null;
  // Здесь можно добавить обработку данных формы, например, отправку на сервер или другую обработку.
  // На данном этапе, форма останется открытой после отправки.
  username_id = localStorage.getItem("username_id");
  socket.send(
    JSON.stringify({
      action: "added_client",
      clientName: clientName,
      clientCount: clientCount,
      current_user_id: username_id,
    })
  );
});

$(".quantity-input").on("change", function () {
  const client_id = $(this).data("id");
  const quantity = Math.max(1, $(this).val()); // Ensure the quantity is not less than 1
  updateQuantity(client_id, quantity);
});

$(".name-input").on("change", function () {
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
  var current_client_id = localStorage.getItem("current_client_id");
  socket.send(
    JSON.stringify({
      action: "dish_order_delete",
      order_id: order_id,
      current_user_id: username_id,
      clientId: current_client_id,
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

const deleteButtons = document.querySelectorAll(".delete-client-btn");

deleteButtons.forEach((button) => {
  button.addEventListener("click", handleDeleteClientButtonClick);
});

const deleteMenuButtons = document.querySelectorAll(".delete-menu-btn");

deleteMenuButtons.forEach((button) => {
  button.addEventListener("click", handleDeleteMenuButtonClick);
});

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
        socket.send(JSON.stringify(new_data_to_send));
      } else {
        socket.send(JSON.stringify(data_to_send));
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
