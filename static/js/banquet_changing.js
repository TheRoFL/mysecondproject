function updateClientsList(data) {
  type = data.type;
  quantity = data.quantity;
  client_id = data.client_id;
  client_name = data.client_name;
  var newDiv = $("<div>", { class: "my_client", "data-id": client_id });

  var nameInput = $("<input>", {
    class: "name-input",
    "data-id": client_id,
    value: type,
  });
  var quantityInput = $("<input>", {
    class: "quantity-input",
    "data-id": client_id,
    value: quantity,
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

  var quantityLabel = $("<span>", { text: " человек " });

  var deleteBtn = $("<button>", {
    class: "delete-client-btn",
    "data-id": client_id,
    text: " Удалить ",
  });
  var menuBtn = $("<button>", {
    class: "menu-client-btn",
    "data-id": client_id,
    text: " Выбрать для редактирования ",
  });

  // Добавляем элементы внутрь созданного div
  newDiv.append(
    nameInput,
    " в количестве ",
    quantityInput,
    quantityLabel,
    deleteBtn,
    menuBtn
  );

  // Добавляем созданный div внутрь <div class="my_extra_clients">
  $(".my_extra_clients").append(newDiv);

  const deleteButtons = document.querySelectorAll(".delete-client-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", handleDeleteClientButtonClick);
  });

  const quantity_inputs = document.querySelectorAll(".quantity-input");
  function quantity_input_change() {
    const client_id = $(this).data("id");
    const quantity = Math.max(1, $(this).val()); // Ensure the quantity is not less than 1
    updateQuantity(client_id, quantity);
  }

  // Присваиваем обработчик события "click" каждому input из массива quantity_inputs
  quantity_inputs.forEach((input) => {
    input.addEventListener("click", quantity_input_change);
  });

  // Создаем элементы
  var clientHeader = $("<div>", {
    class: "client-header",
    "data-id": client_id,
  });
  var clientInfo = $("<div>", { class: "client-info" });
  var clientInfoH1 = $("<h1>", {
    class: "client-info-h1",
    "data-id": client_id,
  });
  clientInfoH1.html(
    `Меню для клиента типа "<span class='client-name' data-id='${client_id}'>${client_name}</span>" 
    в количестве <span class='client-quantity' data-id='${client_id}'>${quantity}</span> человек`
  );
  clientInfo.append(clientInfoH1);

  var clientContainer = $("<div>", {
    class: `client-container-${client_id}`,
    id: `client-container-${client_id}`,
  });

  var clientTotalPrice = $("<h2>", {
    class: "client-total-price",
    style: "margin-top: 50px; margin-left: 20px",
  });
  clientTotalPrice.html(
    `Итого за всех клиентов: <span class='order-price-count' data-id='${client_id}' 
    id='${client_id}'>0</span>.00 руб. x <span class='client-quantity-2'
     data-id='${client_id}'>${quantity}</span> человек = <span class='client-price-count' 
     data-id='${client_id}' id='${client_id}'>0</span>.00 руб.`
  );

  // Добавляем элементы на страницу
  clientHeader.append(clientInfo, clientContainer, clientTotalPrice);
  clientHeader.append("<h1>&nbsp;</h1>");
  var allClientsDiv = $(".all_clients");
  allClientsDiv.append(clientHeader);

  // Добавляем элемент <h1>&nbsp;</h1> как указано в вашем коде
}

function handleNewClientClick(button) {
  var main = document.querySelectorAll(`.my_client`);
  main.forEach((btn) => {
    btn.classList.remove("active");
  });

  var main = document.querySelector(
    `.my_client[data-id="${button.dataset.id}"]`
  );
  main.classList.add("active");

  var filter = $(button).data("filter"); // Получаем значение data-filter
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
      data = JSON.parse(data);

      // Остальной код обработки данных

      const orderButtons = document.querySelectorAll(".order-button");
      var clientId = localStorage.getItem("current_client_id");

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
            handleDeleteDishButtonClickFromMenu(button);
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
              socket.send(JSON.stringify(new_data_to_send));
            } else {
              button.classList.add("chosen");
              button.textContent = `Удалить для "${clientName}"`;
              socket.send(JSON.stringify(data_to_send));
            }
          }
        });
      });

      var animate_orderButtons = document.querySelectorAll(".order-button");
      animate_orderButtons.forEach((button) => {
        button.addEventListener("click", function () {
          var dishImage = document.querySelector(
            `.grid-dish-img[data-id="${button.dataset.id}"]`
          );
          dishImage.classList.add("highlight-image");

          setTimeout(function () {
            dishImage.classList.remove("highlight-image");
          }, 300);
        });
      });
    },
    error: function (xhr, status, error) {
      console.error(error);
    },
  });

  localStorage.setItem("current_client_id", button.dataset.id);
  localStorage.setItem("current_client_name", button.dataset.name);
  menuButtons.forEach((btn) => {
    var current_client_id = localStorage.getItem("current_client_id");
    if (btn.dataset.id == current_client_id) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  x1.classList.remove("hidden2");
  y1.classList.remove("hidden2");
}

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

function handleDeleteClientButtonClick(event) {
  const client_id = event.target.dataset.id; // Получаем id клиента из атрибута data-id
  username_id = localStorage.getItem("username_id");
  current_client_id = localStorage.getItem("current_client_id");
  socket.send(
    JSON.stringify({
      action: "client_delete",
      client_id: client_id,
      current_user_id: username_id,
      current_client_id: current_client_id,
    })
  );
}

function handleDeleteDishButtonClick(event) {
  const mybutton = event.target; // Получаем элемент, на котором произошло событие (в данном случае, кнопка)
  const order_id = mybutton.dataset.id; // Получаем значение data-id из атрибута data-id
  var username_id = localStorage.getItem("username_id");
  var current_client_id = mybutton.dataset.clientid;
  socket.send(
    JSON.stringify({
      action: "dish_order_delete",
      order_id: order_id,
      current_user_id: username_id,
      client_id: current_client_id,
    })
  );
}

function handleDeleteMenuButtonClick(event) {
  const mybutton = event.target; // Получаем элемент, на котором произошло событие (в данном случае, кнопка)
  const menu_id = mybutton.dataset.id; // Получаем значение data-id из атрибута data-id
  var username_id = localStorage.getItem("username_id");
  var current_client_id = mybutton.dataset.clientid;
  socket.send(
    JSON.stringify({
      action: "client_menu_delete",
      menu_id: menu_id,
      current_user_id: username_id,
      client_id: current_client_id,
    })
  );
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
    client_id = data["client_id"];
    client_name = data["client_name"];
    const my_client = document.querySelector(".my_client.created");
    my_client.setAttribute("data-id", client_id);
    my_client.classList.remove("created");

    const button = document.querySelector(".vash_zakaz.created");
    button.setAttribute("data-id", client_id);
    button.setAttribute("data-name", client_name);
    button.classList.remove("created");

    button.addEventListener("click", function (event) {
      if (
        !event.target.classList.contains("delete-btn") &&
        !event.target.classList.contains("delete-menu-btn")
      ) {
        event.stopPropagation();
        // костыль, который прогружает заново меню и навешивает лисенеры, и более не навешивается более 1
        {
          var main = document.querySelectorAll(`.my_client`);
          main.forEach((button) => {
            button.classList.remove("active");
          });
          var main = document.querySelector(
            `.my_client[data-id="${button.dataset.id}"]`
          );
          main.classList.add("active");

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
              data = JSON.parse(data);

              $(document).ready(function () {
                var current_dish_filter = localStorage.getItem("dish-filter");
                const buttonToUnHighlight =
                  document.querySelectorAll(".dish-filter");

                buttonToUnHighlight.forEach((button) => {
                  button.classList.remove("highlighted");
                });

                var buttonToHighlight = $(
                  'button.dish-filter[data-filter="' + "all" + '"]'
                );

                buttonToHighlight.addClass("highlighted");

                $(".grid-container").empty();
                var jsonData = data;

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
                    }).text(`Добавить для "${current_client_name}"`);

                    dishDiv2.append(img, h3);
                    dishDiv.append(dishDiv2, orderButton);
                    gridItem.append(dishDiv);

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

                const orderButtons = document.querySelectorAll(".order-button");

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
                    const current_dishes =
                      document.querySelectorAll(`.grid-dish-img`);
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

                orderButtons.forEach((button) => {
                  const dishId = button.dataset.id;
                  const dishTittle = button.dataset.name;

                  button.addEventListener("click", function () {
                    var username_id = localStorage.getItem("username_id");
                    var clientId = localStorage.getItem("current_client_id");
                    var clientName = localStorage.getItem(
                      "current_client_name"
                    );
                    var current_dish_filter =
                      localStorage.getItem("dish-filter");
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
                // анимация добавления
                var animate_orderButtons =
                  document.querySelectorAll(".order-button");
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
                            dishImage.classList.remove(
                              "disappear-shadow-delete"
                            );
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
            },
            error: function (xhr, status, error) {
              console.error(error);
            },
          });
        }

        localStorage.setItem("current_client_id", button.dataset.id);
        localStorage.setItem("current_client_name", button.dataset.name);
        menuButtons.forEach((button) => {
          var current_client_id = localStorage.getItem("current_client_id");
          if (button.dataset.id == current_client_id) {
            button.classList.add("active");
          } else {
            button.classList.remove("active");
          }
        });
        x1.classList.remove("hidden2");
        y1.classList.remove("hidden2");

        const orderButtons = document.querySelectorAll(".order-button");
        var current_client_name = localStorage.getItem("current_client_name");
        // херь, которая обрабатывает нажатие на кнопку заказать

        function handleOrderButtonClick(button) {
          const dishId = button.dataset.id;
          const dishTittle = button.dataset.name;
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
        }

        orderButtons.forEach((button) => {
          // Remove the old event listener, if any
          button.removeEventListener("click", handleOrderButtonClick, true);
          button.textContent = `Добавить для "${current_client_name}"`;
          button.addEventListener("click", handleOrderButtonClick);
        });
      }
    });
    const newClientNameInput = document.querySelector(".name-input.created");
    newClientNameInput.setAttribute("data-id", client_id);
    newClientNameInput.classList.remove("created");

    const newClientQuantityInput = document.querySelector(
      ".quantity-input.created"
    );

    newClientQuantityInput.setAttribute("data-id", client_id);
    newClientQuantityInput.classList.remove("created");

    const newClientDeleteBtn = document.querySelector(
      ".delete-client-btn.created"
    );
    newClientDeleteBtn.setAttribute("data-id", client_id);
    newClientDeleteBtn.dataset.id = client_id;
    newClientDeleteBtn.classList.remove("created");

    const newClientDeleteImg = document.querySelector(".musorka.created");
    newClientDeleteImg.setAttribute("data-id", client_id);
    newClientDeleteImg.dataset.id = client_id;
    newClientDeleteImg.classList.remove("created");

    localStorage.setItem("current_client_id", client_id);
  } else if (action === "client_deleted") {
    var client_id = data["client_id"];
    var banqet_id = data["current_banquet_id"];
    const clientElement = document.querySelector(
      `.my_client[data-id="${client_id}"]`
    );
    const clientHeaderElement = document.querySelector(
      `.client-header[data-id="${client_id}"]`
    );
    const banqet_id_element = document.querySelector(
      `.banquet-total-price[data-id="${banqet_id}"]`
    );
    banqet_id_element.textContent = data["total_banquet_price"] + ".00 руб.";
    if (clientElement) {
      clientElement.remove();
    }
  } else if (action === "order_deleted") {
    var orderId = data.order_id;
    var client_id = data.client_id;
    var clientOrdersElement = document.querySelector(
      `.adittional-dish[data-id="${orderId}"]`
    );

    // Если элемент найден, удаляем его
    if (clientOrdersElement) {
      clientOrdersElement.remove();
      if (data.orders_left == "false") {
        var clientAdditional = document.querySelector(
          `.additional-dishes[data-id="${client_id}"]`
        );
        clientAdditional.remove();
      }
    }

    const new_OrderTotalPrice = document.querySelector(
      `span.order-price-count[data-id="${data.client_id}"]`
    );
    if (new_OrderTotalPrice) {
      new_OrderTotalPrice.textContent = data.order_total_price;
    }

    const new_client_total_price = document.querySelector(
      `span.client-price-count[data-id="${data.client_id}"]`
    );
    if (new_client_total_price) {
      new_client_total_price.textContent = data.client_total_price;
    }

    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.banqet_id}"]`
    );
    total_banquet_price.textContent = data["total_banquet_price"] + ".00 руб.";
  } else if (action === "client_quantity_changed") {
    client_id = data["client_id"];
    banquet_id = data["banquet_id"];

    const quantity_input = document.querySelector(
      `.quantity-input[data-id="${client_id}"]`
    );
    const client_quantity = document.querySelector(
      `.client-quantity[data-id="${client_id}"]`
    );

    const client_quantity_two = document.querySelector(
      `.client-quantity-2[data-id="${client_id}"]`
    );

    const client_price = document.querySelector(
      `.client-price-count[data-id="${data.client_id}"]`
    );
    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.banquet_id}"]`
    );

    if (client_quantity) {
      client_quantity.textContent = data["new_quantity"];
    }
    // client_quantity_two.textContent = data["new_quantity"]
    if (client_price) {
      client_price.textContent = data["client_total_price"];
    }
    total_banquet_price.textContent = data["total_banquet_price"] + ".00 руб.";
  } else if (action === "client_name_changed") {
    client_id = data["client_id"];
    new_name = data["new_name"];
    const client_name = document.querySelector(
      `.client-name[data-id="${client_id}"]`
    );
    if (client_name) {
      client_name.textContent = new_name;
    }

    current_client_id = localStorage.getItem("current_client_id");
    if (client_id == current_client_id) {
      const client_name_2 = document.querySelectorAll(`.client-name-2`);
      client_name_2.forEach((element) => {
        element.textContent = new_name;
      });
      const client_name_3 = document.querySelectorAll(`.client-name-3`);
      client_name_3.forEach((element) => {
        element.textContent = new_name;
      });
    }

    client_form_to_change = document.querySelector(
      `.vash_zakaz[data-id="${client_id}"]`
    );
    client_form_to_change.dataset.name = new_name;
    localStorage.setItem("current_client_name", new_name);
  } else if (action === "client_menu_deleted") {
    client_id = data["client_id"];
    menu_id = data["menu_id"];

    var MenuDivToRemove = document.querySelectorAll(
      'div[data-id="' + client_id + "-" + menu_id + '"]'
    );

    // Перебираем найденные элементы и удаляем каждый из них
    MenuDivToRemove.forEach(function (element) {
      element.parentNode.removeChild(element);
    });

    const OrderTotalPrice = document.querySelector(
      `span.order-price-count[data-id="${data.client_id}"]`
    );
    if (OrderTotalPrice) {
      OrderTotalPrice.textContent = data.order_total_price;
    }

    const client_total_price = document.querySelector(
      `span.client-price-count[data-id="${data.client_id}"]`
    );
    if (client_total_price) {
      client_total_price.textContent = data.client_total_price;
    }
    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.current_banquet_id}"]`
    );
    total_banquet_price.textContent = data["total_banquet_price"] + ".00 руб.";
  } else if (action === "menu_added") {
    client_id = data["client_id"];
    previous_menu_id = data["previous_menu_id"];
    current_menu_id = data["current_menu_id"];
    // Перебираем найденные элементы и удаляем следующий элемент (menuDiv)
    var targetDataId = client_id + "-" + previous_menu_id; // Здесь укажите нужное значение data-id

    var menuToRemove = document.querySelector(
      `div.client-menu[data-id="${targetDataId}"]`
    );
    // Проверяем, найден ли элемент, и удаляем его, если он найден
    if (menuToRemove) {
      menuToRemove.remove();
    }

    // Создаем основной контейнер div
    var menuDiv = document.createElement("div");
    menuDiv.className = "client-menu";
    data_id = client_id + "-" + current_menu_id;
    menuDiv.setAttribute("data-id", data_id);

    // Создаем контейнер с кнопкой и заголовком
    var btnDiv = document.createElement("div");
    btnDiv.className = "client-menu-btn";

    var menuHeader = document.createElement("h1");
    menuHeader.style.display = "inline-block";
    menuHeader.textContent = "Меню" + ' "' + data["current_menu_name"] + '"';

    var deleteButton = document.createElement("button");
    deleteButton.className = "delete-menu-btn";

    deleteButton.setAttribute("data-id", current_menu_id);
    deleteButton.setAttribute("data-clientid", client_id);
    deleteButton.setAttribute(
      "data-unique_id",
      client_id + "-" + current_menu_id
    );
    deleteButton.style.marginTop = "0px";
    deleteButton.style.marginLeft = "18px";
    deleteButton.textContent = "Удалить";

    btnDiv.appendChild(menuHeader);
    btnDiv.appendChild(deleteButton);

    menuDiv.appendChild(btnDiv);

    // Массив с блюдами и ценами
    var totalCost = data["menu_total_price_count"];
    items = data["current_menu_dishes"];

    // Создаем элементы для каждого блюда
    i = 0;
    items.forEach(function (item) {
      var dishDiv = document.createElement("div");
      dishDiv.className = "client-menu-dish";
      // dishDiv.setAttribute("data-id", item.name);

      var dishHeader = document.createElement("h1");
      dishHeader.style.marginLeft = "25px";
      dishHeader.textContent = "-" + items[i];
      i = i + 1;
      dishDiv.appendChild(dishHeader);
      menuDiv.appendChild(dishDiv);
    });

    // Создаем элемент для общей стоимости
    var totalCostHeader = document.createElement("h1");
    totalCostHeader.style.marginLeft = "15px";
    totalCostHeader.textContent = `Итого: ${totalCost.toFixed(
      2
    )} руб. с человека`;

    menuDiv.appendChild(totalCostHeader);

    // Добавляем разделитель
    var separator = document.createElement("h1");
    separator.textContent = "-------------------------------------------";
    menuDiv.appendChild(separator);

    // Добавляем контейнер на страницу
    // Получаем элемент, после которого хотим вставить меню
    var targetHeaders = document.querySelectorAll(
      `h1.client-info-h1[data-id="${client_id}"]`
    );

    // Вставляем menuDiv после referenceDiv
    targetHeaders.forEach(function (header) {
      header.insertAdjacentElement("afterend", menuDiv.cloneNode(true));
    });

    var current_client_id = localStorage.getItem("current_client_id");
    var currnet_client = document.querySelector(
      `.vash_zakaz[data-id="${current_client_id}"]`
    );
    currnet_client.append(menuDiv);

    var client_menu_total_price = document.querySelector(
      'span.order-price-count[data-id="' + data.client_id + '"]'
    );
    if (client_menu_total_price) {
      client_menu_total_price.textContent = totalCost;
    }

    var client_price_count = document.querySelector(
      'span.client-price-count[data-id="' + data.client_id + '"]'
    );
    if (client_price_count) {
      client_price_count.textContent = data.client_total_price;
    }

    const OrderTotalPrice = document.querySelector(
      `span.order-price-count[data-id="${data.client_id}"]`
    );
    if (OrderTotalPrice) {
      OrderTotalPrice.textContent = data.order_total_price;
    }

    const client_total_price = document.querySelector(
      `span.client-price-count[data-id="${data.client_id}"]`
    );
    if (client_total_price) {
      client_total_price.textContent = data.client_total_price;
    }

    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.current_banquet_id}"]`
    );
    total_banquet_price.textContent = data["total_banquet_price"] + ".00 руб.";

    const menuDeleteButton = document.querySelector(
      `.delete-menu-btn[data-unique_id="${client_id + "-" + current_menu_id}"]`
    );
    menuDeleteButton.addEventListener("click", handleDeleteMenuButtonClick);
  } else if (action == "new_dish_added") {
    var newDiv = document.createElement("div");
    div_name = "client-orders-" + data.current_dish_order_id;
    newDiv.classList.add(div_name);

    // Формируем содержимое для нового div
    var client_dishOrderElement = document.createElement("div");
    var client_dishOrder_product_name = data.current_dish_order_name;
    var client_dishOrder_quantity = data.client_dishOrder_quantity;
    var client_dishOrder_price_count = data.client_dishOrder_price_count;
    client_dishOrderElement.classList.add("client_dishOrder-element");
    client_dishOrderElement.dataset.id = data.current_dish_order_id;
    client_dishOrderElement.innerHTML = `
    <span>
    ${client_dishOrder_product_name} x <span class="client_order_quantity" data-id="${data.client_id}" 
    id="${data.current_dish_order_id}">
    ${client_dishOrder_quantity}</span> шт. =
     <span class="client_order_price" data-id="${data.client_id}" id="${data.current_dish_order_id}">
      ${client_dishOrder_price_count}</span>.00 руб.
    </span>
  `;
    // Создаем кнопку для удаления
    var deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-btn");
    deleteButton.dataset.id = data.current_dish_order_id;
    deleteButton.dataset.clientid = data.client_id;
    deleteButton.dataset.unique_id =
      data.current_dish_order_id + "-" + data.client_id;
    deleteButton.innerText = "X";
    // Добавляем кнопку удаления в div
    client_dishOrderElement.append(deleteButton);
    deleteButton.addEventListener("click", handleDeleteDishButtonClick);
    newDiv.appendChild(client_dishOrderElement);

    var current_client_id = localStorage.getItem("current_client_id");
    var currnet_client = document.querySelector(
      `.vash_zakaz[data-id="${current_client_id}"]`
    );

    currnet_client.append(newDiv);
  } else if (action == "dish_added") {
    var newQuantity = data.client_dishOrder_quantity;
    var client_dishOrder_price_count = data.client_dishOrder_price_count;
    var current_dish_order_id = data.current_dish_order_id;

    var clientContainer = document.getElementById(data.client_id);
    if (clientContainer) {
      const clientOrderPriceElement = document.querySelector(
        `span.client_order_price[id="${current_dish_order_id}"]`
      );

      clientOrderPriceElement.textContent = data.client_dishOrder_price_count;

      const clientOrderQuantity = document.querySelector(
        `span.client_order_quantity[id="${current_dish_order_id}"]`
      );

      clientOrderQuantity.textContent = newQuantity;
    }
  }

  if (action == "dish_added" || action == "new_dish_added") {
    const OrderTotalPrice = document.querySelector(
      `span.order-price-count[data-id="${data.client_id}"]`
    );

    if (OrderTotalPrice) {
      OrderTotalPrice.textContent = data.order_total_price;
    }

    const client_total_price = document.querySelector(
      `span.client-price-count[data-id="${data.client_id}"]`
    );

    if (client_total_price) {
      client_total_price.textContent = data.client_total_price;
    }

    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.current_banquet_id}"]`
    );
    total_banquet_price.textContent = data["total_banquet_price"] + ".00 руб.";
  }
};

socket.onclose = function () {
  console.log("BanquetEditingSocket соединение закрыто. Переподключение...");
};

// JavaScript код для отображения/скрытия формы при нажатии на кнопку
const showFormButton = document.getElementById("showFormBtn");
const clientForm = document.getElementById("clientForm");
const cancelFormButton = document.getElementById("cancelFormBtn");

showFormButton.addEventListener("click", () => {
  showFormButton.remove();
  // Создаем основной div элемент
  const divElement = document.createElement("div");
  divElement.className = "my_client formaClienta menu-client-btn";
  divElement.classList.add("created");
  divElement.setAttribute("data-name", "Выберите клиента");
  localStorage.setItem("current_client_name", "Выберите клиента");
  // Создаем div для header
  const headerDiv = document.createElement("div");
  headerDiv.className = "formaClienta_header";

  // Создаем input для имени
  const nameInput = document.createElement("input");
  nameInput.className = "name-input";
  nameInput.value = "Введите клиента";
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
      $(this).val("Введите клиента");
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

  var buttonDetails = document.createElement("button");
  buttonDetails.className = "details-button";
  buttonDetails.classList.add("created");
  buttonDetails.textContent = "Подробнее";

  divElement.appendChild(buttonDetails);
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
    divElement.setAttribute("data-name", "Выберите клиента");
    localStorage.setItem("current_client_name", "Выберите клиента");
    // Создаем div для header
    const headerDiv = document.createElement("div");
    headerDiv.className = "formaClienta_header";

    // Создаем input для имени
    const nameInput = document.createElement("input");
    nameInput.className = "name-input";
    nameInput.value = "Введите клиента";
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
    divElement.appendChild(vashZakazDiv); // Пустой div для vash_zakaz
    // Добавляем созданный элемент в DOM
    const container = document.getElementById("all_clients"); // Замените "container" на ID родительского контейнера, куда вы хотите добавить элемент
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
        clientName: "Введите клиента",
        clientCount: 0,
        current_user_id: username_id,
      })
    );
  });
  container.appendChild(showFormButton);
  username_id = localStorage.getItem("username_id");
  socket.send(
    JSON.stringify({
      action: "added_client",
      clientName: "Введите клиента",
      clientCount: 0,
      current_user_id: username_id,
    })
  );
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

$(".quantity-input").on("input", function () {
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

$(".name-input").on("input", function () {
  const client_id = $(this).data("id");
  var currentValue = $(this).val();
  $(this).val = currentValue.trim();
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

$(".name-input").on("change", function () {
  var currentValue = $(this).val();
  const client_id = $(this).data("id");

  if (currentValue.length == 0) {
    $(this).val("Введите клиента");
    const name = $(this).val();

    username_id = localStorage.getItem("username_id");
    $(this).val = currentValue.trim();
    socket.send(
      JSON.stringify({
        action: "client_name_update",
        client_id: client_id,
        current_user_id: username_id,
        name: name,
      })
    );
  }
});

const deleteMenuButtons = document.querySelectorAll(".delete-menu-btn");
deleteMenuButtons.forEach((button) => {
  button.addEventListener("click", handleDeleteMenuButtonClick);
});

const orderButtons = document.querySelectorAll(".order-button");
var client_id = localStorage.getItem("current_client_id");

orderButtons.forEach((button) => {
  if (button.innerText === "Выберите клиента") {
    button.disabled = true;
  }
  const dishId = button.dataset.id;
  const dishTittle = button.dataset.name;
  if (client_id != "") {
    button.addEventListener("click", function () {
      var username_id = localStorage.getItem("username_id");
      var client_id = localStorage.getItem("current_client_id");
      const data_to_send = {
        action: "added_dish",
        message: `Заказ "${dishTittle}" добавлен`,
        current_dish_id: dishId,
        current_user_id: username_id,
        current_client_id: client_id,
      };
      var currentUrl = window.location.href;
      const urlObject = new URL(currentUrl);
      dish_filter = urlObject.searchParams.get("dish-filter");
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
          current_client_id: client_id,
        };
        socket.send(JSON.stringify(new_data_to_send));
      } else {
        socket.send(JSON.stringify(data_to_send));
      }
    });
  }
});

const OrderDeleteButtons = document.querySelectorAll(".delete-btn");
OrderDeleteButtons.forEach(function (button) {
  button.addEventListener("click", handleDeleteDishButtonClick);
});

var current_dish_filter = localStorage.getItem("dish-filter");
var buttonToHighlight = $(
  'button.dish-filter[data-filter="' + current_dish_filter + '"]'
);

buttonToHighlight.addClass("highlighted");

const deleteButtons = document.querySelectorAll(".delete-client-btn");

deleteButtons.forEach((button) => {
  button.addEventListener("click", handleDeleteClientButtonClick);
});
