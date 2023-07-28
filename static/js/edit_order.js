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

// Отправляем данные на сервер при нажатии на кнопку "+" или "-"
const increaseButtons = document.querySelectorAll(".increase-btn");
const decreaseButtons = document.querySelectorAll(".decrease-btn");
const deleteButtons = document.querySelectorAll(".delete-btn");

increaseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const orderId = button.dataset.id;
    var username_id = "{{user.id}}";
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
    var username_id = "{{user.id}}";
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
    var username_id = "{{user.id}}";
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

  if (action) {
    const total = document.querySelector(`.total`);
    total.textContent = "Сумма заказа: " + data["total"] + ".00 рублей";

    const total_total = document.querySelector(`.total_total`);
    total_total.textContent = "Сумма заказа: " + data["total"] + ".00 рублей";

    const quantity = document.querySelector(
      `.order-product-quantity[data-id="${id}"]`
    );

    const order_quantity = document.querySelector(
      `.order_quantity[data-id="${id}"]`
    );
    order_quantity.textContent = data["quantity"];

    const order_price = document.querySelector(`.order_price[data-id="${id}"]`);

    if (action === "increase") {
      const quantitySpan = document.querySelector(`.quantity[data-id="${id}"]`);
      const currentQuantity = parseInt(quantitySpan.textContent);
      quantitySpan.textContent = currentQuantity + 1;
    } else if (action === "decrease") {
      const quantitySpan = document.querySelector(`.quantity[data-id="${id}"]`);
      const currentQuantity = parseInt(quantitySpan.textContent);
      quantitySpan.textContent = currentQuantity - 1;
    } else if (action === "delete") {
      const gridItemElement = document.querySelector(
        `.quantity[data-id="${id}"]`
      );
      gridItemElement.remove();
      const orderElement = document.querySelector(`[data-id="${id}"]`);
      if (orderElement) {
        orderElement.remove();
        const gridItemElement = document.querySelector(
          `.quantity[data-id="${id}"]`
        );
        gridItemElement.remove();
      }
    }

    const quantitySpan = document.querySelector(`.quantity[data-id="${id}"]`);
    const int_quantity = parseInt(quantitySpan.textContent);
    const int_order_price = parseInt(order_price.textContent);
    const sum = int_quantity * int_order_price;
    console.log(int_quantity);
    console.log(int_order_price);
    console.log(sum);
    const order_sum = document.querySelector(`.order_sum[data-id="${id}"]`);
    order_sum.textContent = sum;
  }
});
