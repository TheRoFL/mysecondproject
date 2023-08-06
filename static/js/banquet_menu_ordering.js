// Код JavaScript для обработки WebSocket-соединения и уведомлений
let MySocket;

function initWebSocket() {
  MySocket = new ReconnectingWebSocket(
    "ws://" + window.location.host + "/ws/BanquetEditingSocket/"
  );

  MySocket.onopen = function () {
    console.log("WebSocket соединение открыто.");
  };

  MySocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
  };

  MySocket.onclose = function () {
    console.log("WebSocket соединение закрыто. Переподключение...");
  };
}

function SendData(data) {
  // Проверяем, что WebSocket-соединение открыто, прежде чем отправить уведомление
  if (MySocket && MySocket.readyState === WebSocket.OPEN) {
    MySocket.send(JSON.stringify(data));
  }
}
const orderButtons = document.querySelectorAll(".order-button");
// Добавляем обработчик для каждой кнопки "Заказать"
var clientId = localStorage.getItem("current_client_id");

// Код, который выполняется, если {{user.id}} не равен "none"

orderButtons.forEach((button) => {
  if (button.innerText === "Выберите клиента") {
    button.disabled = true;
  }
  const dishId = button.dataset.id;
  const dishTittle = button.dataset.name;
  if (clientId != "") {
    button.addEventListener("click", function () {
      // Если WebSocket-соединение уже открыто, отправляем уведомление на сервер
      if (MySocket && MySocket.readyState === WebSocket.OPEN) {
        var username_id = localStorage.getItem("username_id");
        var clientId = localStorage.getItem("current_client_id");
        const data_to_send = {
          action: "added_dish",
          message: `Заказ "${dishTittle}" добавлен`,
          current_dish_id: dishId,
          current_user_id: username_id,
          current_client_id: clientId,
        };
        SendData(data_to_send);
        location.reload();
      } else {
        // Если WebSocket-соединение еще не открыто, создаем новое и отправляем уведомление
        initWebSocket();
        var username_id = localStorage.getItem("username_id");
        var clientId = localStorage.getItem("current_client_id");
        const data_to_send = {
          action: "added_dish",
          message: `Заказ "${dishTittle}" добавлен`,
          current_dish_id: dishId,
          current_client_id: clientId,
        };
        SendData(data_to_send);
        location.reload();
      }
      location.reload();
    });
  }
});

// Инициализация WebSocket-соединения при загрузке страницы
initWebSocket();
