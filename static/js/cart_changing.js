const socket = new ReconnectingWebSocket(
  "ws://" + window.location.host + "/ws/CartEditingSocket/"
);

socket.onopen = function () {
  console.log("CartEditingSocket соединение открыто.");
};

socket.onmessage = function (e) {
  const notification = JSON.parse(e.data);
  const text = notification["action"] + " " + notification["id"];
};

socket.onclose = function () {
  console.log("CartEditingSocket соединение закрыто. Переподключение...");
};

// Function to update the quantity display and send the quantity to the server
function updateQuantity(orderId, quantity) {
  // Update the display
  $(`.quantity[data-id="${orderId}"]`).text(quantity);
  var username_id = localStorage.getItem("username_id");
  const data = { orderId, quantity };
  socket.send(
    JSON.stringify({
      action: "quantity_update",
      id: orderId,
      username_id: username_id,
      quantity: quantity,
    })
  );
}

$(".quantity-input").on("change", function () {
  const orderId = $(this).data("id");
  const newQuantity = Math.max(1, $(this).val()); // Ensure the quantity is not less than 1
  updateQuantity(orderId, newQuantity);
});
const dishes = document.querySelectorAll(".main-div");
// Отправляем данные на сервер при нажатии на кнопку "+" или "-"
const deleteButtons = document.querySelectorAll(".delete-btn");
const increaseButtons = document.querySelectorAll(".increase-btn");
const decreaseButtons = document.querySelectorAll(".decrease-btn");

increaseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const orderId = button.dataset.id;
    var username_id = localStorage.getItem("username_id");
    socket.send(
      JSON.stringify({
        action: "increase",
        id: orderId,
        username_id: username_id,
      })
    );
  });
});
decreaseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const orderId = button.dataset.id;
    var username_id = localStorage.getItem("username_id");
    socket.send(
      JSON.stringify({
        action: "decrease",
        id: orderId,
        username_id: username_id,
      })
    );
  });
});

deleteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const orderId = button.dataset.id;
    var username_id = localStorage.getItem("username_id");
    socket.send(
      JSON.stringify({
        action: "delete",
        id: orderId,
        username_id: username_id,
      })
    );
  });
});

// Обработка сообщений от сервера
socket.addEventListener("message", function (event) {
  const data = JSON.parse(event.data);
  const { action, id } = data;

  console.log(data);
  if (action) {
    const total = document.querySelector(`.total`);
    total.textContent = "Сумма заказа: " + data["total"] + ".00 рублей";

    const total_total = document.querySelector(`.total_total`);
    total_total.textContent = "Сумма заказа: " + data["total"] + ".00 рублей";

    const order_product_quantity = document.querySelector(
      `.order-product-quantity[data-id="${id}"]`
    );
    order_product_quantity.textContent = data["quantity"];

    const quantity_input = document.querySelector(
      `.quantity-input[data-id="${id}"]`
    );
    quantity_input.textContent = data["quantity"];

    const order_quantity = document.querySelector(
      `.order_quantity[data-id="${id}"]`
    );
    order_quantity.textContent = data["quantity"];

    const order_price = document.querySelector(`.order_price[data-id="${id}"]`);

    if (action === "increase") {
      const quantity_input = document.querySelector(
        `.quantity-input[data-id="${id}"]`
      );
      quantity_input.value = data["quantity"];
    } else if (action === "decrease") {
      const quantity_input = document.querySelector(
        `.quantity-input[data-id="${id}"]`
      );
      quantity_input.value = data["quantity"];
    } else if (action === "delete") {
      const gridItemElement = document.querySelector(
        `.main-div[data-id="${id}"]`
      );
      gridItemElement.remove();
      const gridItemElementDetail = document.querySelector(
        `.main-div-detail[data-id="${id}"]`
      );
      gridItemElementDetail.remove();
    }

    const int_quantity = quantity_input.value;
    const int_order_price = parseInt(order_price.textContent);
    const sum = int_quantity * int_order_price;
    const order_sum = document.querySelector(`.order_sum[data-id="${id}"]`);
    order_sum.textContent = sum + ".00";
  }
});
