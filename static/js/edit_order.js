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
    var username = "{{user.username}}";
    console.log(username);
    socket.send(
      JSON.stringify({
        action: "increase",
        id: orderId,
        current_user_id: username,
      })
    );
  });
});

decreaseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const orderId = button.dataset.id;
    var username = "{{user.username}}";
    console.log(current_user_id);
    socket.send(
      JSON.stringify({
        action: "decrease",
        id: orderId,
        current_user_id: username,
      })
    );
  });
});

deleteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const orderId = button.dataset.id;
    var username = "{{user.username}}";
    console.log(current_user_id);
    socket.send(
      JSON.stringify({
        action: "delete",
        id: orderId,
        current_user_id: username,
      })
    );
  });
});

// Обработка сообщений от сервера
socket.addEventListener("message", function (event) {
  const data = JSON.parse(event.data);
  const { action, id } = data;

  if (action === "increase") {
    const quantitySpan = document.querySelector(`.quantity[data-id="${id}"]`);
    const currentQuantity = parseInt(quantitySpan.textContent);
    quantitySpan.textContent = currentQuantity + 1;
  } else if (action === "decrease") {
    const quantitySpan = document.querySelector(`.quantity[data-id="${id}"]`);
    const currentQuantity = parseInt(quantitySpan.textContent);
    quantitySpan.textContent = currentQuantity - 1;
  } else if (action === "delete") {
    const orderElement = document.querySelector(`[data-id="${id}"]`);
    if (orderElement) {
      orderElement.remove();
    }
  }
});
