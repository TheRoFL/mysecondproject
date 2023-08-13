$("button.dish-filter").on("click", function () {
  var filter = $(this).data("filter"); // Получаем значение data-filter
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
      // Обработка успешного ответа
      data = JSON.parse(data);

      $(document).ready(function () {
        var current_dish_filter = localStorage.getItem("dish-filter");
        const buttonToUnHighlight = document.querySelectorAll(".dish-filter");

        buttonToUnHighlight.forEach((button) => {
          button.classList.remove("highlighted");
        });
        var buttonToHighlight = $(
          'button.dish-filter[data-filter="' + current_dish_filter + '"]'
        );

        buttonToHighlight.addClass("highlighted");

        $(".grid-container").empty();
        var jsonData = data;

        jsonData.forEach(function (item, index) {
          var gridItem = $("<div>");
          var gridContainer = $("<div>", { class: "grid-item" });
          var dishDiv = $("<div>", {
            class: "dishes",
            "data-name": item.fields.name,
            "data-tittle": item.fields.name,
            "data-weight": item.fields.weight,
            "data-price": item.fields.price,
            "data-sostav": item.fields.ingredients,
            "data-type": item.fields.type,
          });

          var img = $("<img>", {
            src: "http://localhost:8000/media/" + item.fields.image,
          });

          var h3 = $("<h3>").html(
            `${item.fields.name} / ${item.fields.weight} гр. / ${item.fields.price} руб.`
          );

          var clientId = localStorage.getItem("current_client_id");
          var current_client_name = localStorage.getItem("current_client_name");
          if (clientId) {
            var orderButton = $("<button>", {
              class: "order-button",
              "data-id": item.pk,
              "data-name": item.fields.name,
            }).text(`Добавить для "${current_client_name}"`);
          } else {
            var orderButton = $("<button>", {
              class: "order-button",
              "data-id": index + 1,
              "data-name": item.fields.name,
            }).text("Выберите клиента");
          }

          dishDiv.append(img, h3);
          gridItem.append(dishDiv, $("<h2>").append(orderButton));

          gridContainer.append(gridItem);
          $(".grid-container").append(gridContainer);
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
              var current_dish_filter = localStorage.getItem("dish-filter");
              const data_to_send = {
                action: "added_dish",
                message: `Заказ "${dishTittle}" добавлен`,
                current_dish_id: dishId,
                current_user_id: username_id,
                current_client_id: clientId,
              };
              var currentUrl = window.location.href;
              const urlObject = new URL(currentUrl);
              dish_filter = current_dish_filter;
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
      });
    },
    error: function (xhr, status, error) {
      console.error(error);
    },
  });
});

$("button.menu-client-btn").on("click", function () {
  console.log("sdfsd");
});