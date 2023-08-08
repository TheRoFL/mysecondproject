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
  }
};

socket.onclose = function () {
  console.log("CartEditingSocket соединение закрыто. Переподключение...");
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
// function handleDeleteDishButtonClick(event) {
//   const mybutton = event.target; // Получаем элемент, на котором произошло событие (в данном случае, кнопка)
//   const order_id = mybutton.dataset.id; // Получаем значение data-id из атрибута data-id
//   var username_id = localStorage.getItem("username_id");
//   var current_client_id = localStorage.getItem("current_client_id");
//   socket.send(
//     JSON.stringify({
//       action: "dish_order_delete",
//       order_id: order_id,
//       current_user_id: username_id,
//       clientId: current_client_id,
//     })
//   );
// }

// const deleteButtons = document.querySelectorAll(".delete-client-btn");

// deleteButtons.forEach((button) => {
//   button.addEventListener("click", handleDeleteClientButtonClick);
// });
