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
      console.log(data);
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
        if (jsonData["current_menu"]) {
          jsonData["current_menu"].forEach(function (item, index) {
            var gridItem = $("<div>");
            var gridContainer = $("<div>", { class: "grid-item2" });
            var dishDiv = $("<div>", {
              // class: "dishes",
              "data-name": item.fields.name,
              "data-tittle": item.fields.name,
              "data-weight": item.fields.weight,
              "data-price": item.fields.price,
              "data-sostav": item.fields.ingredients,
              "data-type": item.fields.type,
            });

            var h1 = document.createElement("h1");
            h1.textContent = item.fields.type;
            dishDiv.append(h1);
            var current_client_name = localStorage.getItem(
              "current_client_name"
            );

            var orderButton = $("<button>", {
              class: "order-button",
              "data-id": item.pk,
              "data-name": item.fields.type,
            }).text(`Добавить для "${current_client_name}"`);

            gridItem.append(dishDiv, $("<h2>").append(orderButton));

            gridContainer.append(gridItem);

            var jsonDishesData = data;

            jsonDishesData["current_menu_dishes"].forEach(function (
              item,
              index
            ) {
              dishes = JSON.parse(item);
              console.log(dishes);
            });
            $(".grid-container").append(gridContainer);
          });
        } else {
          jsonData.forEach(function (item, index) {
            if (item.model != "Banquet.menusample") {
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

              if (item.fields.name) {
                var h3 = $("<h3>").html(
                  `${item.fields.name.replace(/_/g, " ")} / ${
                    item.fields.price
                  } руб.`
                );
              }

              var current_client_name = localStorage.getItem(
                "current_client_name"
              );

              var orderButton = $("<button>", {
                class: "order-button",
                "data-id": item.pk,
                "data-name": item.fields.name,
              }).text(`Добавить для "${current_client_name}"`);

              dishDiv.append(img, h3);
              gridItem.append(dishDiv, $("<h2>").append(orderButton));

              gridContainer.append(gridItem);
            } else {
              var gridItem = $("<div>");
              var gridContainer = $("<div>", { class: "grid-item2" });
              var dishDiv = $("<div>", {
                // class: "dishes",
                "data-name": item.fields.name,
                "data-tittle": item.fields.name,
                "data-weight": item.fields.weight,
                "data-price": item.fields.price,
                "data-sostav": item.fields.ingredients,
                "data-type": item.fields.type,
              });

              var h1 = document.createElement("h1");
              h1.textContent = item.fields.type;
              dishDiv.append(h1);
              var current_client_name = localStorage.getItem(
                "current_client_name"
              );

              var orderButton = $("<button>", {
                class: "order-button",
                "data-id": item.pk,
                "data-name": item.fields.type,
              }).text(`Добавить для "${current_client_name}"`);

              gridItem.append(dishDiv, $("<h2>").append(orderButton));

              gridContainer.append(gridItem);
            }
            $(".grid-container").append(gridContainer);
          });
        }

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

        const ws = document.querySelectorAll(".dishes");
        var x, y;
        for (let i = 0; i < ws.length; i++) {
          var div = `<div class = "overflow hidden" id="${i}"></div>
                <div class="modWind hidden" id="${i + 3500}">
                <div ><img style = "width: 200px"
                src="http://localhost:8000/media/menu_images/${ws[
                  i
                ].getAttribute("data-type")}/${ws[i].getAttribute(
            "data-tittle"
          )}.png"
                /> </div>
                  <div class="name">${ws[i].getAttribute("data-name")}</div>
                  <div class="grams">${ws[i].getAttribute(
                    "data-weight"
                  )} гр</div>
                  <div class="price">${ws[i].getAttribute(
                    "data-price"
                  )} руб</div>
                  <div class="sostav">${ws[i].getAttribute("data-sostav")}</div>
              </div>`;
          document
            .querySelector(".dishes")
            .insertAdjacentHTML("beforebegin", div);

          ws[i].addEventListener("click", () => {
            x = document.getElementById(i);
            y = document.getElementById(i + 3500);
            x.classList.remove("hidden");
            y.classList.remove("hidden");
          });

          const exit = document.querySelectorAll(".overflow");

          exit.forEach((element) => {
            element.addEventListener("click", () => {
              x = document.getElementById(i);
              y = document.getElementById(i + 3500);
              x.classList.add("hidden");
              y.classList.add("hidden");
            });
          });
        }

        document.addEventListener("keydown", (e) => {
          if (e.code == "Escape") {
            x.classList.add("hidden");
            y.classList.add("hidden");
          }
        });
      });
    },
    error: function (xhr, status, error) {
      console.error(error);
    },
  });
});
