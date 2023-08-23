function ChangeChosenStatus() {
  var clientId = localStorage.getItem("current_client_id");
  var clientName = localStorage.getItem("current_client_name");
  var orderButtons_ = document.querySelectorAll(".order-button");

  var all_dishes = [];
  orderButtons_.forEach((button) => {
    const dishId = button.dataset.id;
    all_dishes.push(dishId);
  });

  const filter_ = localStorage.getItem("dish-filter");
  var requestParams2 = {};
  if (filter_ != "samples") {
    requestParams2 = {
      action: "dish",
      dish_ids: all_dishes,
      client_id: clientId,
    };
  } else {
    requestParams2 = {
      action: "menu",
      dish_ids: all_dishes,
      client_id: clientId,
    };
  }

  $.ajax({
    url: "http://127.0.0.1:8000/banquet/json/",
    method: "GET",
    data: requestParams2,
    dataType: "json",
    success: function (data) {
      data = JSON.parse(data);
      console.log(data);

      orderButtons_.forEach((button) => {
        const dishId = button.dataset.id;
        if (Array.isArray(data)) {
          if (data.includes(Number(dishId))) {
            const button_to_delete = document.querySelector(
              `.order-button[data-id="${dishId}"]`
            );
            button_to_delete.textContent = `Удалить для "${clientName}"`;
            button_to_delete.classList.add("chosen");
          }
        }
      });
    },
    error: function (xhr, status, error) {
      console.error(error);
    },
  });
}

function handleDeleteDishButtonClickFromMenu(button) {
  const order_id = button.dataset.id;
  var username_id = localStorage.getItem("username_id");
  var current_client_id = localStorage.getItem("current_client_id");

  // Выполняем необходимые действия с полученными данными
  socket.send(
    JSON.stringify({
      action: "dish_order_delete_new",
      order_id: order_id,
      current_user_id: username_id,
      client_id: current_client_id,
    })
  );
}

function handleDeleteMenuButtonClick(button) {
  const menu_id = button.dataset.id; // Получаем значение data-id из атрибута data-id
  var username_id = localStorage.getItem("username_id");
  var current_client_id = localStorage.getItem("current_client_id");
  socket.send(
    JSON.stringify({
      action: "client_menu_delete",
      menu_id: menu_id,
      current_user_id: username_id,
      client_id: current_client_id,
    })
  );
}

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
            var MenuGridContainer = $("<div>", { class: "menu-container" });

            var h1 = $("<h1>", { class: "menu-item1" });
            var header = $("<h2>").text(item.fields.type);
            var current_client_name = localStorage.getItem(
              "current_client_name"
            );

            var orderButton = $("<button>", {
              class: "order-button",
              "data-id": item.pk,
              "data-name": item.fields.type,
            }).text(`Выбрать для "${current_client_name}"`);

            h1.append(header, orderButton);
            MenuGridContainer.append(h1);
            $(".grid-container").append(MenuGridContainer);
            var jsonDishesData = data;

            var check = [];
            jsonDishesData["current_menu_dishes"].forEach(function (dish) {
              if (
                item.fields.dishes.includes(dish.pk) & !check.includes(dish.pk)
              ) {
                check.push(dish.pk);
                var dishElement = document.createElement("div", {
                  class: "menu-item",
                });

                var innerHtml = `
                <div class="menu-item" data-name="${
                  dish.fields.name
                }" data-type="${dish.fields.type}" data-tittle="${
                  dish.fields.name
                }">
                <h1 class="dishes" data-id="${
                  dish.pk + "/" + index
                }" data-name="${dish.fields.name.replace(
                  /_/g,
                  " "
                )}" data-tittle="${dish.fields.name.replace(
                  / /g,
                  "_"
                )}" data-weight="${dish.fields.weight}" data-price="${
                  dish.fields.price
                }" data-sostav="${dish.fields.ingredients}" data-type="${
                  dish.fields.type
                }"><img class="grid-dish-img" data-id="${
                  dish.pk + "/" + index
                }" src="http://localhost:8000/media/${dish.fields.image}"></h1>
                  <h1>${dish.fields.name}</h1>
                  <h2>Цена: ${dish.fields.price} руб.</h2>
                </div>
              `;

                dishElement.innerHTML = innerHtml;

                MenuGridContainer.append(dishElement);

                $(".grid-container").MenuGridContainer;
                GridContainer = document.querySelector(`.grid-container`);
                GridContainer.classList.add("menu-mode");
              }
            });
          });
        } else {
          GridContainer = document.querySelector(`.grid-container`);
          GridContainer.classList.remove("menu-mode");
          jsonData.forEach(function (item, index) {
            if (item.model != "Banquet.menusample") {
              var gridItem = $("<div>", { class: "grid-item-2" });
              var gridContainer = $("<div>", { class: "grid-item" });
              var dishDiv = $("<div>", {});

              var dishDiv2 = $("<div>", {
                class: "dishes",
                "data-id": item.pk,
                "data-name": item.fields.name.replace(/_/g, " "),
                "data-tittle": item.fields.name,
                "data-weight": item.fields.weight,
                "data-price": item.fields.price,
                "data-sostav": item.fields.ingredients,
                "data-type": item.fields.type,
              });

              var img = $("<img>", {
                class: "grid-dish-img",
                id: item.pk,
                "data-id": item.pk,
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
              }).text(`Выбрать для "${current_client_name}"`);

              dishDiv2.append(img, h3);
              dishDiv.append(dishDiv2, orderButton);
              gridItem.append(dishDiv);

              gridContainer.append(gridItem);
            } else {
              var gridItem = $("<div>");
              var gridContainer = $("<div>", { class: "grid-item2" });
              var dishDiv = $("<div>", {
                class: "dishes",
                "data-id": item.pk,
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
              }).text(`Выбрать для "${current_client_name}"`);

              gridItem.append(dishDiv, $("<h2>").append(orderButton));

              gridContainer.append(gridItem);
            }
            $(".grid-container").append(gridContainer);
          });
        }

        const orderButtons = document.querySelectorAll(".order-button");
        orderButtons.forEach((button) => {
          const dishId = button.dataset.id;
          const dishTittle = button.dataset.name;

          button.addEventListener("click", function () {
            var username_id = localStorage.getItem("username_id");
            var clientId = localStorage.getItem("current_client_id");
            var clientName = localStorage.getItem("current_client_name");
            var current_dish_filter = localStorage.getItem("dish-filter");
            const data_to_send = {
              action: "added_dish",
              message: `Заказ "${dishTittle}" добавлен`,
              current_dish_id: dishId,
              current_user_id: username_id,
              current_client_id: clientId,
            };
            dish_filter = current_dish_filter;
            var is_menu = false;
            if (dish_filter == "samples") {
              is_menu = true;
            }
            if (button.classList.contains("chosen")) {
              if (!is_menu) {
                handleDeleteDishButtonClickFromMenu(button);
              } else {
                handleDeleteMenuButtonClick(button);
              }
              button.classList.remove("chosen");
              button.textContent = `Выбрать для "${clientName}"`;
            } else {
              if (is_menu) {
                const new_data_to_send = {
                  action: "menu_add",
                  message: `Заказ "${button.dataset.name}" добавлен`,
                  current_menu_id: button.dataset.id,
                  current_user_id: username_id,
                  current_client_id: clientId,
                };

                orderButtons.forEach((button) => {
                  button.classList.remove("chosen");
                  button.textContent = `Выбрать для "${clientName}"`;
                });

                button.classList.add("chosen");
                button.textContent = `Удалить для "${clientName}"`;
                socket.send(JSON.stringify(new_data_to_send));
              } else {
                button.classList.add("chosen");
                button.textContent = `Удалить для "${clientName}"`;
                socket.send(JSON.stringify(data_to_send));
              }
            }
          });
        });

        const ws = document.querySelectorAll(".dishes");
        var x, y;
        for (let i = 0; i < ws.length; i++) {
          var div = `<div class = "overflow hidden" id="${
            "overflow" + i
          }"></div>
              <div class="modWind hidden" id="${"modWind" + i}">
              <div ><img style = "width: 250px"
              src="http://localhost:8000/media/menu_images/${ws[i].getAttribute(
                "data-type"
              )}/${ws[i].getAttribute("data-tittle")}.png"
              /> </div>
                <div class="name">${ws[i].getAttribute("data-name")}</div>
                <div class="grams">${ws[i].getAttribute("data-weight")} гр</div>
                <div class="price">${ws[i].getAttribute("data-price")} руб</div>
                <div class="sostav">${ws[i].getAttribute("data-sostav")}</div>
            </div>
            `;
          document
            .querySelector(".dishes")
            .insertAdjacentHTML("beforebegin", div);

          ws[i].addEventListener("click", () => {
            const button_id = ws[i].dataset.id;
            const current_dish = document.querySelector(
              `.grid-dish-img[data-id="${button_id}"]`
            );
            current_dish.classList.add("active");
            x = document.getElementById("overflow" + i);
            y = document.getElementById("modWind" + i);
            x.classList.remove("hidden");
            y.classList.remove("hidden");
          });

          const exit = document.getElementById("overflow" + i);

          exit.addEventListener("click", () => {
            const current_dishes = document.querySelectorAll(`.grid-dish-img`);
            current_dishes.forEach((button) => {
              button.classList.remove("active");
            });
            x = document.getElementById("overflow" + i);
            y = document.getElementById("modWind" + i);
            x.classList.add("hidden");
            y.classList.add("hidden");
          });
        }

        document.addEventListener("keydown", (e) => {
          if (e.code == "Escape") {
            x.classList.add("hidden");
            y.classList.add("hidden");
          }
        });

        // анимация добавления
        var animate_orderButtons = document.querySelectorAll(".order-button");
        animate_orderButtons.forEach((button) => {
          button.addEventListener("click", function () {
            if (button.disabled != true) {
              var dishImage = document.querySelector(
                `.grid-dish-img[data-id="${button.dataset.id}"]`
              );

              if (button.classList.contains("chosen")) {
                if (dishImage) {
                  dishImage.classList.add("appear-shadow");

                  // Убираем класс через секунду
                  setTimeout(function () {
                    dishImage.classList.remove("appear-shadow");
                    dishImage.classList.add("disappear-shadow");
                  }, 900);
                  setTimeout(function () {
                    dishImage.classList.remove("disappear-shadow");
                  }, 1400);
                }
              } else {
                if (dishImage) {
                  dishImage.classList.add("appear-shadow-delete");

                  // Убираем класс через секунду
                  setTimeout(function () {
                    dishImage.classList.remove("appear-shadow-delete");
                    dishImage.classList.add("disappear-shadow-delete");
                  }, 900);
                  setTimeout(function () {
                    dishImage.classList.remove("disappear-shadow-delete");
                  }, 1400);
                }
              }

              button.disabled = true;
              var current_client_name = localStorage.getItem(
                "current_client_name"
              );
              if (!button.classList.contains("chosen")) {
                button.textContent = `Удалено для "${current_client_name}"`;
                setTimeout(function () {
                  button.disabled = false;
                  button.textContent = `Выбрать для "${current_client_name}"`;
                }, 1000);
              } else {
                button.textContent = `Выбрано для "${current_client_name}"`;
                setTimeout(function () {
                  button.disabled = false;
                  button.textContent = `Удалить для "${current_client_name}"`;
                }, 1000);
              }
            }
          });
        });
      });

      setTimeout(ChangeChosenStatus, 1);
      const mainGrid = document.querySelector(".grid-container");

      mainGrid.classList.add("disappear");

      setTimeout(() => {
        mainGrid.classList.remove("disappear");
        mainGrid.classList.add("appear");
      }, 250);
      setTimeout(() => {
        mainGrid.classList.remove("appear");
      }, 1);

      // setTimeout(function () {
      //   const GridItems = document.querySelectorAll(".grid-item");
      //   GridItems.forEach((item, index) => {
      //     console.log(item);
      //     setTimeout(() => {
      //       item.classList.add("appear");
      //     }, 250 * index);
      //     setTimeout(() => {
      //       item.classList.remove("appear");
      //     }, 1);
      //   });
      // }, 1);
    },
    error: function (xhr, status, error) {
      console.error(error);
    },
  });
});
