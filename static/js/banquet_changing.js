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
    const clientDishOrderElement = document.querySelector(
      `[data-id="${orderId}"]`
    );
    console.log(clientDishOrderElement);
    if (clientDishOrderElement) {
      clientDishOrderElement
        .closest(".client_dishOrder-button-element")
        .remove();
      location.reload();
    }
  } else if (action === "client_quantity_changed") {
    clientId = data["client_id"];
    banquet_id = data["banquet_id"];
    const client_quantity = document.querySelector(
      `.client-quantity[data-id="${clientId}"]`
    );
    const client_quantity_two = document.querySelector(
      `.client-quantity-2[data-id="${clientId}"]`
    );
    const total_price_count = document.querySelector(
      `.total-price-count[data-id="${clientId}"]`
    );
    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${banquet_id}"]`
    );
    total_price_count.textContent = data["total_price_count"];
    client_quantity.textContent = data["new_quantity"];
    client_quantity_two.textContent = data["new_quantity"];
    total_banquet_price.textContent = data["total_banquet_price"] + ".00 руб.";
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

$(".quantity-input").on("change", function () {
  const client_id = $(this).data("id");
  const quantity = Math.max(1, $(this).val()); // Ensure the quantity is not less than 1
  updateQuantity(client_id, quantity);
});

function handleDeleteClientButtonClick(event) {
  const client_id = event.target.dataset.id; // Получаем id клиента из атрибута data-id
  username_id = localStorage.getItem("username_id");
  socket.send(
    JSON.stringify({
      action: "client_delete",
      client_id: client_id,
      current_user_id: username_id,
    })
  );
}
function handleDeleteDishButtonClick(event) {
  const mybutton = event.target; // Получаем элемент, на котором произошло событие (в данном случае, кнопка)
  const order_id = mybutton.dataset.id; // Получаем значение data-id из атрибута data-id
  var username_id = localStorage.getItem("username_id");
  console.log(order_id);
  socket.send(
    JSON.stringify({
      action: "dish_order_delete",
      order_id: order_id,
      current_user_id: username_id,
    })
  );
}

const deleteButtons = document.querySelectorAll(".delete-client-btn");
const deleteDishButtons = document.querySelectorAll(".delete-btn");
deleteButtons.forEach((button) => {
  button.addEventListener("click", handleDeleteClientButtonClick);
});
deleteDishButtons.forEach((button) => {
  button.addEventListener("click", handleDeleteDishButtonClick);
});
