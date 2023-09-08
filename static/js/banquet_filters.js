function formatInteger(integer) {
  if (typeof integer === "number" && Number.isInteger(integer)) {
    const integerStr = integer.toLocaleString("en-US"); // Преобразование числа в строку с разделением тысяч
    const parts = integerStr.split(",");

    // Разделение на разряды
    let formattedInteger = "";
    while (parts.length > 0) {
      if (formattedInteger.length > 0) {
        formattedInteger = " " + formattedInteger;
      }
      formattedInteger = parts[parts.length - 1] + formattedInteger;
      parts.pop();
    }

    return formattedInteger;
  } else {
    return "Invalid input";
  }
}

function CreateQuantityStatusButton(
  container,
  client_id,
  order_id,
  order_quantity
) {
  // Создание обертки для кнопок управления
  const deleteBtnWrapper = document.createElement("div");
  deleteBtnWrapper.className = "delete-btn-wrapper";

  const deleteBtnWrapper2 = document.createElement("div");
  deleteBtnWrapper2.className = "delete-btn-wrapper3";

  // Создание кнопки уменьшения
  const decreaseBtn = document.createElement("button");
  decreaseBtn.className = "decrease-btn2";
  decreaseBtn.setAttribute("data-id", order_id);
  decreaseBtn.setAttribute("data-clientid", client_id);

  const decreaseBtnSvg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  decreaseBtnSvg.setAttribute("width", "1em");
  decreaseBtnSvg.setAttribute("height", "1em");
  decreaseBtnSvg.setAttribute("viewBox", "0 0 24 24");
  decreaseBtnSvg.setAttribute("fill", "none");
  decreaseBtnSvg.className = "decrease-btn-svg";

  const decreaseBtnPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  decreaseBtnPath.setAttribute("fill-rule", "evenodd");
  decreaseBtnPath.setAttribute("clip-rule", "evenodd");
  decreaseBtnPath.setAttribute(
    "d",
    "M6 12a1 1 0 0 0 1 1h10a1 1 0 1 0 0-2H7a1 1 0 0 0-1 1Z"
  );
  decreaseBtnPath.setAttribute("fill", "currentColor");

  decreaseBtnSvg.appendChild(decreaseBtnPath);
  decreaseBtn.appendChild(decreaseBtnSvg);

  // Создание спана для вывода числа
  var is_additional_ = localStorage.getItem("is_additional");
  var dishNumberInput = null;
  if (is_additional_ == "false") {
    dishNumberInput = document.createElement("span");
    dishNumberInput.className = "dish-number-input2";
    dishNumberInput.setAttribute("data-dish-id", order_id);
    dishNumberInput.setAttribute("type", "text");
    dishNumberInput.textContent = order_quantity;
  } else {
    dishNumberInput = document.createElement("input");
    dishNumberInput.className = "dish-number-input2-additional";
    dishNumberInput.setAttribute("data-dish-id", order_id);
    dishNumberInput.setAttribute("type", "text");
    dishNumberInput.value = order_quantity;

    dishNumberInput.addEventListener("input", (event) => {
      const current_user_id = localStorage.getItem("username_id");
      var currentValue = event.target.value;
      var order_id = event.target.getAttribute("data-dish-id");

      // Удаление всех символов, кроме цифр
      currentValue = currentValue.replace(/\D/g, "");

      // Проверяем длину введенного текста
      if (currentValue.length > 4) {
        // Если длина больше максимальной, обрезаем текст до максимальной длины
        currentValue = 3500;
      }

      const quantity = Math.min(3500, Math.max(0, currentValue)); // Ограничиваем значение до 3500
      event.target.value = quantity; // Обновляем значение поля ввода

      socket.send(
        JSON.stringify({
          action: "additional_order_quantity_change",
          current_user_id: current_user_id,
          new_quantity: quantity,
          order_id: order_id,
        })
      );
    });
  }

  // Создание кнопки увеличения
  const increaseBtn = document.createElement("button");
  increaseBtn.className = "increase-btn2";
  increaseBtn.setAttribute("data-id", order_id);
  increaseBtn.setAttribute("data-clientid", client_id);
  const increaseBtnSvg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  increaseBtnSvg.setAttribute("width", "1em");
  increaseBtnSvg.setAttribute("height", "1em");
  increaseBtnSvg.setAttribute("viewBox", "0 0 24 24");
  increaseBtnSvg.setAttribute("fill", "none");
  increaseBtnSvg.className = "increase-btn-svg2";

  const increaseBtnPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  increaseBtnPath.setAttribute("fill-rule", "evenodd");
  increaseBtnPath.setAttribute("clip-rule", "evenodd");
  increaseBtnPath.setAttribute(
    "d",
    "M12 6a1 1 0 0 0-1 1v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7a1 1 0 0 0-1-1Z"
  );
  increaseBtnPath.setAttribute("fill", "currentColor");

  increaseBtnSvg.appendChild(increaseBtnPath);
  increaseBtn.appendChild(increaseBtnSvg);

  // Добавление элементов на страницу
  deleteBtnWrapper2.appendChild(decreaseBtn);
  deleteBtnWrapper2.appendChild(dishNumberInput);
  deleteBtnWrapper2.appendChild(increaseBtn);
  deleteBtnWrapper.appendChild(deleteBtnWrapper2);

  if (container) {
    container.appendChild(deleteBtnWrapper);
  }

  var is_addit__ = localStorage.getItem("is_additional");
  var action = "additional_order_increase";
  var action2 = "additional_order_decrease";
  if (is_addit__ == "true") {
    var action = "additional_order_increase_additional";
    var action2 = "additional_order_decrease_additional";
  }
  increaseBtn.addEventListener("click", () => {
    const order_id = increaseBtn.dataset.id;
    const client_id = increaseBtn.dataset.clientid;
    const dishNumberInputAdittional = document.querySelector(
      `.dish-number-input-adittional[data-dish-id="${order_id}"]`
    );

    if (is_addit__ == "true") {
      if (dishNumberInputAdittional) {
        if (dishNumberInputAdittional.value >= 3500) {
          dishNumberInputAdittional.textContent = 3500;
        } else {
          socket.send(
            JSON.stringify({
              action: action,
              order_id: order_id,
              client_id: client_id,
              current_client_id: client_id,
              current_user_id: current_user_id,
            })
          );
        }
      } else {
        const dishNumberInputAdittional2 = document.querySelector(
          `.dish-number-input2-additional[data-dish-id="${order_id}"]`
        );

        if (dishNumberInputAdittional2.value >= 3500) {
          dishNumberInputAdittional2.textContent = 3500;
        } else {
          socket.send(
            JSON.stringify({
              action: action,
              order_id: order_id,
              client_id: client_id,
              current_client_id: client_id,
              current_user_id: current_user_id,
            })
          );
        }
      }
    } else {
      socket.send(
        JSON.stringify({
          action: "additional_order_increase",
          order_id: order_id,
          client_id: client_id,
          current_client_id: client_id,
          current_user_id: current_user_id,
        })
      );
    }
  });

  decreaseBtn.addEventListener("click", () => {
    const order_id = decreaseBtn.dataset.id;
    const client_id = decreaseBtn.dataset.clientid;
    socket.send(
      JSON.stringify({
        action: action2,
        order_id: order_id,
        client_id: client_id,
        current_client_id: client_id,
        current_user_id: current_user_id,
      })
    );
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

function handleButtonClick(button) {
  var username_id = localStorage.getItem("username_id");
  var clientId = localStorage.getItem("current_client_id");
  var clientName = localStorage.getItem("current_client_name");
  if (clientName == "") {
    clientName = "Дополнительные блюда";
  }
  var current_dish_filter = localStorage.getItem("dish-filter");

  var dishId = button.dataset.id;
  var dishTitle = button.dataset.name;

  const data_to_send = {
    action: "added_dish",
    message: `Заказ "${dishTitle}" добавлен`,
    current_dish_id: dishId,
    current_user_id: username_id,
    current_client_id: clientId,
  };

  var dish_filter = current_dish_filter;
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
        message: `Заказ "${dishTitle}" добавлен`,
        current_menu_id: dishId,
        current_user_id: username_id,
        current_client_id: clientId,
      };

      var orderMenuButtons = document.querySelectorAll(`.order-menu-button`);
      orderMenuButtons.forEach((orderButton) => {
        orderButton.classList.remove("chosen");
        orderButton.textContent = `Выбрать для "${clientName}"`;
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
}

function handleButtonClickAddittional(button) {
  var username_id = localStorage.getItem("username_id");
  var clientName = "Дополнительные блюда";

  var dishId = button.dataset.id;

  const data_to_send = {
    action: "added_dish_additional",
    current_dish_id: dishId,
    current_user_id: username_id,
  };

  if (button.classList.contains("chosen")) {
    handleDeleteDishButtonClickFromMenu(button);
    button.classList.remove("chosen");
    button.textContent = `Выбрать для "${clientName}"`;
  } else {
    button.classList.add("chosen");
    button.textContent = `Удалить для "${clientName}"`;

    socket.send(JSON.stringify(data_to_send));
  }
}

function handleSepOrderClick(button) {
  var username_id = localStorage.getItem("username_id");
  var clientId = localStorage.getItem("current_client_id");
  var clientName = localStorage.getItem("current_client_name");

  var dishId = button.dataset.id;
  var dishTitle = button.dataset.name;

  const data_to_send = {
    action: "menu_add_sep",
    message: `Заказ "${dishTitle}" добавлен`,
    current_menu_id: dishId,
    current_user_id: username_id,
    current_client_id: clientId,
  };

  socket.send(JSON.stringify(data_to_send));

  var menu_id = button.dataset.id;
  var order_sep_button = document.querySelector(
    `.order-sep-button[data-id="${menu_id}"]`
  );
  order_sep_button.textContent = `Выбрано по отдельности для "${clientName}"`;
  order_sep_button.disabled = true;
}

function LoadMenu(filter = null, name = null) {
  localStorage.setItem("dish-filter", filter);
  var requestParams = {
    "dish-filter": filter,
    "dish-name": name,
  };
  $.ajax({
    url: "http://127.0.0.1:8000/api/LoadMenu/",
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
              class: "order-menu-button",
              "data-id": item.pk,
              "data-name": item.fields.type,
            }).text(`Выбрать для "${current_client_name}"`);

            var orderSepButton = $("<button>", {
              class: "order-sep-button",
              "data-id": item.pk,
              "data-name": item.fields.type,
            }).text(`Выбрать по отдельности для "${current_client_name}"`);

            var ButtonsFlex = $("<div>", {
              class: "buttons-flex",
              style: "display: flex;",
            });

            ButtonsFlex.append(orderButton);
            ButtonsFlex.append(orderSepButton);
            h1.append(header);
            h1.append(ButtonsFlex);
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
                  <h2>Цена: ${dish.fields.price} ₽</h2>
                  
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
              var dishDiv = $("<div>", { class: "grid-item-3" });

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
                  } ₽`
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
              var orderButtonContainer = document.createElement("div");
              orderButtonContainer = $(
                "<div class='order-btn-container'>"
              ).append(orderButton);
              orderButtonContainer.attr("data-id", item.pk);
              // orderButtonContainer.attr("data-dishOrder-id", item.pk);
              dishDiv.append(dishDiv2);
              dishDiv.append(orderButtonContainer);
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

        if (!jsonData["current_menu"]) {
          document.getElementById("dish-search").style.display = "inline-block";
          if (jsonData[0] == null) {
            var noResults = $("<h1 class='no-results'>").text(
              "По вашему запросу ничего не найдено!"
            );
            $(".grid-container").append(noResults);
          }
        } else {
          document.getElementById("dish-search").style.display = "none";
        }

        const orderButtons = document.querySelectorAll(".order-button");
        var is_addit = localStorage.getItem("is_additional");
        if (is_addit == "false") {
          orderButtons.forEach((button) => {
            button.addEventListener("click", function () {
              handleButtonClick(this);
            });
          });
        } else {
          orderButtons.forEach((button) => {
            button.addEventListener("click", function () {
              handleButtonClickAddittional(this);
            });
          });
        }

        const orderMenuButtons =
          document.querySelectorAll(".order-menu-button");
        orderMenuButtons.forEach((button) => {
          button.addEventListener("click", function () {
            handleButtonClick(this);
          });
        });

        const orderSepButtons = document.querySelectorAll(".order-sep-button");
        orderSepButtons.forEach((button) => {
          button.addEventListener("click", function () {
            handleSepOrderClick(this);
          });
        });

        const ws = document.querySelectorAll(".dishes");
        var x, y;
        for (let i = 0; i < ws.length; i++) {
          var div = `<div class = "overflow hidden" id="${
            "overflow" + ws[i].getAttribute("data-id")
          }"></div>
              <div class="modWind hidden" id="${
                "modWind" + ws[i].getAttribute("data-id")
              }">
                <div class="flex-mod-dish"><img class="dish-img-mod"
                src="http://localhost:8000/media/menu_images/${ws[
                  i
                ].getAttribute("data-type")}/${ws[i].getAttribute(
            "data-tittle"
          )}.png"
                </div>
                <div class="mod-dish-info">
                  <div class="name">${ws[i].getAttribute("data-name")}</div>
                  <div class="grams">${ws[i].getAttribute(
                    "data-weight"
                  )} гр</div>
                  <div class="price">${ws[i].getAttribute(
                    "data-price"
                  )} руб</div>
                  <div class="sostav">${ws[i].getAttribute("data-sostav")}</div>
                </div>
            </div>
            <div class="mod-dish-decription">
            <div class="decription">Тут будет описание...</div> 
            
            </div>
            `;

          //   <button class="order-button mod" data-id="${ws[i].getAttribute(
          //     "data-id"
          //   )}" data-name="${ws[i].getAttribute(
          //   "data-name"
          // )}">Выбрать для "${ws[i].getAttribute("data-name")}"</button>

          document.querySelector("body").insertAdjacentHTML("beforeend", div);

          ws[i].addEventListener("click", () => {
            const button_id = ws[i].dataset.id;
            const current_dish = document.querySelector(
              `.grid-dish-img[data-id="${button_id}"]`
            );
            current_dish.classList.add("active");
            x = document.getElementById(
              "overflow" + ws[i].getAttribute("data-id")
            );
            y = document.getElementById(
              "modWind" + ws[i].getAttribute("data-id")
            );

            const gridContainer = document.querySelector(".menuu");
            const overflowElement = document.querySelector(".overflow");
            // overflowElement.style.height = `${gridContainer.offsetHeight}px`;

            x.classList.remove("hidden");
            y.classList.remove("hidden");
          });

          const exit = document.getElementById(
            "overflow" + ws[i].getAttribute("data-id")
          );

          exit.addEventListener("click", () => {
            const current_dishes = document.querySelectorAll(`.grid-dish-img`);
            current_dishes.forEach((button) => {
              button.classList.remove("active");
            });
            x = document.getElementById(
              "overflow" + ws[i].getAttribute("data-id")
            );
            y = document.getElementById(
              "modWind" + ws[i].getAttribute("data-id")
            );
            x.classList.add("hidden");
            y.classList.add("hidden");
          });
        }

        var animate_orderButtons = document.querySelectorAll(".order-button");
        animate_orderButtons.forEach((button) => {
          button.addEventListener("click", function () {
            AddBtnAnimation(this);
          });
        });
      });

      var is_addit2 = localStorage.getItem("is_additional");
      if (is_addit2 == "true") {
        to_delete.style.display = "none";
      } else {
        to_delete.style.display = "block";
      }
      if (is_addit2 == "true") {
        setTimeout(ChangeChosenStatusAdditional, 100);
      } else {
        setTimeout(ChangeChosenStatus, 100);
      }

      const mainGrid = document.querySelector(".grid-container");

      // if (name == null) {
      //   mainGrid.classList.add("disappear");

      //   setTimeout(() => {
      //     mainGrid.classList.remove("disappear");
      //     mainGrid.classList.add("appear");
      //   }, 250);
      //   setTimeout(() => {
      //     mainGrid.classList.remove("appear");
      //   }, 1);
      // }

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
}

function AddBtnAnimation(button) {
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
    var current_client_name = localStorage.getItem("current_client_name");
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
}

function ChangeChosenStatus() {
  var clientId = localStorage.getItem("current_client_id");
  var clientName = localStorage.getItem("current_client_name");
  var orderButtons_ = document.querySelectorAll(".order-button");
  var orderMenuButtons_ = document.querySelectorAll(".order-menu-button");
  var all_dishes = [];
  orderButtons_.forEach((button) => {
    const dishId = button.dataset.id;
    all_dishes.push(dishId);
  });

  var all_menu_dishes = [];
  orderMenuButtons_.forEach((button) => {
    const dishId = button.dataset.id;
    all_menu_dishes.push(dishId);
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
      dish_ids: all_menu_dishes,
      client_id: clientId,
    };
  }
  $.ajax({
    url: "http://127.0.0.1:8000/api/ChangeChosenStatus/",
    method: "GET",
    data: requestParams2,
    dataType: "json",
    success: function (data) {
      data = JSON.parse(data);
      console.log(data);

      orderButtons_.forEach((button) => {
        const dishId = button.dataset.id;
        const clientId = localStorage.getItem("current_client_id");
        if (Array.isArray(data)) {
          if (data[0].includes(Number(dishId))) {
            const button_to_delete = document.querySelector(
              `.order-button[data-id="${dishId}"]`
            );

            const dish_order_id = data[1][dishId];
            const order_quantity = data[2][dish_order_id];
            if (button_to_delete) {
              button_to_delete.textContent = `Удалить для "${clientName}"`;

              const container = document.querySelector(
                `.order-btn-container[data-id="${dishId}"]`
              );
              CreateQuantityStatusButton(
                container,
                clientId,
                dish_order_id,
                order_quantity
              );
              button_to_delete.remove();
              button_to_delete.classList.add("chosen");
            }
          }
        }
      });

      orderMenuButtons_.forEach((button) => {
        const dishId = button.dataset.id;
        const clientName = localStorage.getItem("current_client_name");
        if (Array.isArray(data)) {
          if (data[0].includes(Number(dishId))) {
            const button_to_delete_menu = document.querySelector(
              `.order-menu-button[data-id="${dishId}"]`
            );
            if (button_to_delete_menu) {
              button_to_delete_menu.textContent = `Удалить для "${clientName}"`;
              button_to_delete_menu.classList.add("chosen");
            }
          }
        }
      });
    },
    error: function (xhr, status, error) {
      console.error(error);
    },
  });
}

function ChangeChosenStatusAdditional() {
  var clientName = "Дополнительные блюда";
  var username_id = localStorage.getItem("username_id");
  var orderButtons_ = document.querySelectorAll(".order-button");
  var all_dishes = [];
  orderButtons_.forEach((button) => {
    const dishId = button.dataset.id;
    all_dishes.push(dishId);
  });

  var requestParams = {
    action: "dish",
    dish_ids: all_dishes,
    username_id: username_id,
  };

  $.ajax({
    url: "http://127.0.0.1:8000/api/ChangeChosenStatusAdditional/",
    method: "GET",
    data: requestParams,
    dataType: "json",
    success: function (data) {
      data = JSON.parse(data);
      console.log(data);

      orderButtons_.forEach((button) => {
        const dishId = button.dataset.id;
        if (Array.isArray(data)) {
          if (data[0].includes(Number(dishId))) {
            const button_to_delete = document.querySelector(
              `.order-button[data-id="${dishId}"]`
            );

            const dish_order_id = data[1][dishId];
            const order_quantity = data[2][dish_order_id];
            if (button_to_delete) {
              button_to_delete.textContent = `Удалить для "${clientName}"`;

              const container = document.querySelector(
                `.order-btn-container[data-id="${dishId}"]`
              );
              CreateQuantityStatusButton(
                container,
                0,
                dish_order_id,
                order_quantity
              );
              button_to_delete.remove();
              button_to_delete.classList.add("chosen");
            }
          }
        }
      });
    },
    error: function (xhr, status, error) {
      console.error(error);
    },
  });
}

function CreateClient() {
  showFormButton.remove();
  // Создаем основной div элемент
  const divElement = document.createElement("div");
  divElement.className = "my_client formaClienta menu-client-btn";
  divElement.classList.add("created");
  divElement.setAttribute("data-name", "Шаблон клиента");
  localStorage.setItem("current_client_name", "Шаблон клиента");
  // Создаем div для header
  const headerDiv = document.createElement("div");
  headerDiv.className = "formaClienta_header";

  // Создаем input для имени
  const nameInput = document.createElement("input");
  nameInput.className = "name-input";
  nameInput.value = "Шаблон клиента";
  nameInput.classList.add("created");
  nameInput.addEventListener("change", function () {
    const client_id = $(this).data("id");
    var currentValue = $(this).val();
    // Проверяем длину введенного текста
    if (currentValue.length > 15) {
      // Если длина больше максимальной, обрезаем текст до максимальной длины
      $(this).val(currentValue.slice(0, 15));
    }
    if (currentValue.length == 0) {
      // Если длина больше максимальной, обрезаем текст до максимальной длины
      $(this).val("Шаблон клиента");
    }
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

  nameInput.addEventListener("input", function () {
    const client_id = $(this).data("id");
    var currentValue = $(this).val();
    // Проверяем длину введенного текста
    if (currentValue.length > 15) {
      // Если длина больше максимальной, обрезаем текст до максимальной длины
      $(this).val(currentValue.slice(0, 15));
    }

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

  const pElement = document.createElement("p");
  pElement.style.fontSize = "10px";
  pElement.style.display = "inline";
  pElement.style.color = "#fff";
  pElement.style.marginBottom = "12px";
  pElement.textContent = "x";

  const quantityInput = document.createElement("input");
  quantityInput.className = "quantity-input";
  quantityInput.value = "0";
  quantityInput.classList.add("created");

  quantityInput.addEventListener("input", function () {
    const client_id = $(this).data("id");
    var currentValue = $(this).val();
    var all_clients = document.querySelectorAll(".quantity-input");
    // Удаление всех символов, кроме цифр
    currentValue = currentValue.replace(/\D/g, "");

    var sum = 0;
    all_clients.forEach(function (input) {
      sum += parseInt(input.value);
    });

    if (sum > 2000) {
      currentValue = 2000 - (sum - parseInt(currentValue));
    }
    // Проверяем длину введенного текста
    if (currentValue.length > 4) {
      // Если длина больше максимальной, обрезаем текст до максимальной длины
      currentValue = 2000;
    }

    const quantity = Math.min(2000, Math.max(0, currentValue)); // Ограничиваем значение до 2000
    $(this).val(quantity); // Обновляем значение поля ввода
    updateQuantity(client_id, quantity);
  });

  // Создаем кнопку для удаления клиента
  const deleteClientButton = document.createElement("button");
  deleteClientButton.className = "delete-client-btn";
  deleteClientButton.classList.add("created");
  // Создаем изображение внутри кнопки
  const deleteImage = document.createElement("img");
  deleteImage.className = "musorka";
  deleteImage.src = "/static/images/Мусорка.png";
  deleteImage.alt = "delete";
  deleteImage.classList.add("created");

  // Добавляем элементы в иерархию
  deleteClientButton.appendChild(deleteImage);
  headerDiv.appendChild(nameInput);
  headerDiv.appendChild(pElement);
  headerDiv.appendChild(quantityInput);
  headerDiv.appendChild(deleteClientButton);
  divElement.appendChild(headerDiv);

  const vashZakazDiv = document.createElement("div");
  vashZakazDiv.className = "vash_zakaz";
  vashZakazDiv.classList.add("created");
  divElement.appendChild(vashZakazDiv); // Пустой div для vash_zakaz

  const client_menu = document.createElement("div");
  client_menu.className = "client-menu";
  client_menu.classList.add("created");
  vashZakazDiv.appendChild(client_menu);

  const additional_dishes = document.createElement("div");
  additional_dishes.className = "additional-dishes";
  additional_dishes.classList.add("created");
  vashZakazDiv.appendChild(additional_dishes);

  const client_total_price = document.createElement("div");
  client_total_price.className = "client-total-price";
  client_total_price.classList.add("created");
  var ClientTotalPrice = `Итого:
              <span class="order-price-bold">
              <span class="order-price-count created">
                0</span>.00 ₽</span> x
              <span class="client-quantity created">0</span> человек =
              <span class="order-price-bold">
              <span class="client-price-count created">0</span>.00 ₽</span>`;

  client_total_price.innerHTML = ClientTotalPrice;

  var buttonDetails = document.createElement("button");
  buttonDetails.className = "details-button";
  buttonDetails.classList.add("created");
  buttonDetails.textContent = "Редактировать";

  MenuAndPriceDiv = document.createElement("div");
  MenuAndPriceDiv.className = "client-total-price-and-menu-btn";

  MenuAndPriceDiv.append(client_total_price);
  MenuAndPriceDiv.append(buttonDetails);
  divElement.appendChild(MenuAndPriceDiv);

  // Добавляем созданный элемент в DOM
  const container = document.getElementById("all_clients"); // Замените "container" на ID родительского контейнера, куда вы хотите добавить элемент
  container.appendChild(divElement);

  const showFormButton2 = document.createElement("button");
  showFormButton2.id = "showFormBtn";
  showFormButton2.className = "formaClienta";
  showFormButton2.textContent = "+";
  showFormButton2.addEventListener("click", () => {
    showFormButton2.remove();
    // Создаем основной div элемент
    const divElement = document.createElement("div");
    divElement.className = "my_client formaClienta menu-client-btn";
    divElement.classList.add("created");
    divElement.setAttribute("data-name", "Шаблон клиента");
    localStorage.setItem("current_client_name", "Шаблон клиента");
    // Создаем div для header
    const headerDiv = document.createElement("div");
    headerDiv.className = "formaClienta_header";

    // Создаем input для имени
    const nameInput = document.createElement("input");
    nameInput.className = "name-input";
    nameInput.value = "Шаблон клиента";
    nameInput.classList.add("created");
    nameInput.addEventListener("input", function () {
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
    // Создаем элемент p
    const pElement = document.createElement("p");
    pElement.style.fontSize = "10px";
    pElement.style.display = "inline";
    pElement.style.color = "#fff";
    pElement.style.marginBottom = "12px";
    pElement.textContent = "x";

    // Создаем input для количества
    const quantityInput = document.createElement("input");
    quantityInput.className = "quantity-input";
    quantityInput.value = "1";
    quantityInput.classList.add("created");
    quantityInput.setAttribute("pattern", "[A-Za-z]{3}");

    quantityInput.addEventListener("input", function () {
      const client_id = $(this).data("id");
      const quantity = Math.max(1, $(this).val()); // Ensure the quantity is not less than 1
      updateQuantity(client_id, quantity);
    });

    // Создаем кнопку для удаления клиента
    const deleteClientButton = document.createElement("button");
    deleteClientButton.className = "delete-client-btn";
    deleteClientButton.classList.add("created");
    // Создаем изображение внутри кнопки
    const deleteImage = document.createElement("img");
    deleteImage.className = "musorka";
    deleteImage.src = "/static/images/Мусорка.png";
    deleteImage.alt = "delete";
    deleteImage.classList.add("created");

    // Добавляем элементы в иерархию
    deleteClientButton.appendChild(deleteImage);
    headerDiv.appendChild(nameInput);
    headerDiv.appendChild(pElement);
    headerDiv.appendChild(quantityInput);
    headerDiv.appendChild(deleteClientButton);
    divElement.appendChild(headerDiv);

    const vashZakazDiv = document.createElement("div");
    vashZakazDiv.className = "vash_zakaz";
    vashZakazDiv.classList.add("created");

    vashZakazDiv.appendChild(ClientTotalPrice);
    divElement.appendChild(vashZakazDiv);
    const container = document.getElementById("all_clients");
    container.appendChild(divElement);

    const showFormButton2 = document.createElement("button");
    showFormButton2.id = "showFormBtn";
    showFormButton2.className = "formaClienta";
    showFormButton2.textContent = "+";
    showFormButton2.addEventListener;
    container.appendChild(showFormButton);
    username_id = localStorage.getItem("username_id");
    socket.send(
      JSON.stringify({
        action: "added_client",
        clientName: "Шаблон клиента",
        clientCount: 0,
        current_user_id: username_id,
      })
    );
  });
  container.appendChild(showFormButton);
}

$("button.dish-filter").on("click", function () {
  var filter = $(this).data("filter"); // Получаем значение data-filter
  localStorage.setItem("dish-filter", filter);

  LoadMenu(filter);
});

var to_delete = document.querySelector(`.dish-filter[data-filter="samples"]`);
