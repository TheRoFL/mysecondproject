// Код JavaScript для обработки WebSocket-соединения и уведомлений

const notificationArea = document.getElementById("notification-area");
const orderButtons = document.querySelectorAll(".order-button");
let MySocket;

function initWebSocket() {
  MySocket = new ReconnectingWebSocket(
    "ws://" + window.location.host + "/ws/CartSocket/"
  );

  MySocket.onopen = function () {
    console.log("WebSocket соединение открыто.");
  };

  MySocket.onmessage = function (e) {
    const notification = JSON.parse(e.data);
    alert(notification);
  };

  MySocket.onclose = function () {
    console.log("WebSocket соединение закрыто. Переподключение...");
  };
}

function SendNotification(notification) {
  // Проверяем, что WebSocket-соединение открыто, прежде чем отправить уведомление
  if (MySocket && MySocket.readyState === WebSocket.OPEN) {
    MySocket.send(JSON.stringify(notification));
  } else {
    console.log("WebSocket соединение не установлено.");
  }
}

// Добавляем обработчик для каждой кнопки "Заказать"
orderButtons.forEach((button) => {
  const dishId = button.dataset.id;
  const dishTittle = button.dataset.name;
  button.addEventListener("click", function () {
    // Если WebSocket-соединение уже открыто, отправляем уведомление на сервер
    if (MySocket && MySocket.readyState === WebSocket.OPEN) {
      var current_user_id = "{{user.id}}";
      console.log(current_user_id);
      const notificationData = {
        message: `Заказ "${dishTittle}" принят.`,
        id: dishId,
        current_user_id: current_user_id,
      };
      SendNotification(notificationData);
    } else {
      // Если WebSocket-соединение еще не открыто, создаем новое и отправляем уведомление
      initWebSocket();
      var current_user_id = "{{user.id}}";
      console.log(current_user_id);
      const notificationData = {
        message: `Заказ "${dishTittle}" принят.`,
        id: dishId,
        current_user_id: current_user_id,
      };
      SendNotification(notificationData);
    }
  });
});

// Инициализация WebSocket-соединения при загрузке страницы
initWebSocket();
