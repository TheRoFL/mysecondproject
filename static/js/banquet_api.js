function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      // Проверяем, начинается ли куки с нужного имени (name)
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function ChangeBanquetData(data_to_send) {
  var csrftoken = getCookie("csrftoken");
  $.ajax({
    url: "http://127.0.0.1:8000/api/ChangeBanquetData/",
    method: "POST",
    data: data_to_send,
    dataType: "json",
    headers: { "X-CSRFToken": csrftoken },
    success: function (data) {
      data = JSON.parse(data);
      console.log(data);
      RecievedBanquetData(data);
    },
    error: function (xhr, status, error) {
      console.error(error);
    },
  });
}

function RecievedBanquetData(data) {
  const action = data["action"];
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

    const detailsButton = document.querySelector(".details-button.created");
    detailsButton.addEventListener("click", function (event) {
      if (
        !event.target.classList.contains("delete-btn") &&
        !event.target.classList.contains("delete-menu-btn")
      ) {
        event.stopPropagation();
        LoadMenu("all");
        localStorage.setItem("is_additional", false);
        localStorage.setItem("current_client_id", button.dataset.id);
        localStorage.setItem("current_client_name", button.dataset.name);
        menuButtons.forEach((button) => {
          var current_client_id = localStorage.getItem("current_client_id");
          var my_client_form = document.querySelector(
            `.my_client[data-id="${current_client_id}"]`
          );
          my_client_form.classList.add("active");
          button.classList.add("active");
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
              ChangeBanquetData(new_data_to_send);
            } else {
              button.classList.add("chosen");
              button.textContent = `Удалить для "${clientName}"`;
              ChangeBanquetData(data_to_send);
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
    detailsButton.classList.remove("created");

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

    const NewClientMenu = document.querySelector(".client-menu.created");
    NewClientMenu.setAttribute("data-id", client_id);
    NewClientMenu.dataset.id = client_id;
    NewClientMenu.classList.remove("created");

    const NewAdditionalDishes = document.querySelector(
      ".additional-dishes.created"
    );
    NewAdditionalDishes.setAttribute("data-id", client_id);
    NewAdditionalDishes.dataset.id = client_id;
    NewAdditionalDishes.classList.remove("created");

    const NewClientTotalPrice = document.querySelector(
      ".client-total-price.created"
    );
    NewClientTotalPrice.setAttribute("data-id", client_id);
    NewClientTotalPrice.dataset.id = client_id;
    NewClientTotalPrice.classList.remove("created");

    const OrderPriceCount = document.querySelector(
      ".order-price-count.created"
    );
    OrderPriceCount.text = "0";
    OrderPriceCount.setAttribute("data-id", client_id);
    OrderPriceCount.id = client_id;
    OrderPriceCount.classList.remove("created");

    const clientPriceCount = document.querySelector(
      ".client-price-count.created"
    );
    clientPriceCount.text = "0";
    clientPriceCount.setAttribute("data-id", client_id);
    clientPriceCount.id = client_id;
    clientPriceCount.classList.remove("created");

    const clientQuantity = document.querySelector(".client-quantity.created");
    clientQuantity.text = "0";
    clientQuantity.setAttribute("data-id", client_id);
    clientQuantity.id = client_id;
    clientQuantity.classList.remove("created");

    localStorage.setItem("current_client_id", client_id);
  } else if (action === "client_deleted") {
    var client_id = data["client_id"];
    var current_banquet_id = data["current_banquet_id"];
    const clientElement = document.querySelector(
      `.my_client[data-id="${client_id}"]`
    );
    const current_banquet_id_element = document.querySelector(
      `.banquet-total-price[data-id="${current_banquet_id}"]`
    );
    current_banquet_id_element.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";
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
          `.additional-dishes[data-banquet-id="${data.current_banquet_id}"]`
        );
        var common_additional = document.querySelector(
          `.additional-dishes[data-id="${data.client_id}"]`
        );
        if (common_additional) {
          while (common_additional.firstChild) {
            common_additional.removeChild(common_additional.firstChild);
          }
        }
        if (data.additinal_price >= 0) {
          while (clientAdditional.firstChild) {
            clientAdditional.removeChild(clientAdditional.firstChild);
          }
        }
      }
    }

    const new_OrderTotalPrice = document.querySelector(
      `span.order-price-count[data-id="${data.client_id}"]`
    );
    if (new_OrderTotalPrice) {
      new_OrderTotalPrice.textContent = formatInteger(data.order_total_price);
    }

    const clientPriceCount = document.querySelector(
      `span.client-price-count[data-id="${data.client_id}"]`
    );
    if (clientPriceCount) {
      clientPriceCount.textContent = formatInteger(data.client_total_price);
    }

    const new_client_total_price = document.querySelector(
      `span.order-price-count-additional[data-id="${data.current_banquet_id}"]`
    );
    if (new_client_total_price && data.additinal_price) {
      new_client_total_price.textContent = formatInteger(
        parseInt(data.additinal_price)
      );
    }

    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.current_banquet_id}"]`
    );

    total_banquet_price.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";

    DeleteQuantityButton(data["dish_id"], data["dish_name"]);
  } else if (action === "client_quantity_changed") {
    client_id = data["client_id"];
    banquet_id = data["banquet_id"];

    const client_quantity = document.querySelector(
      `.client-quantity[data-id="${client_id}"]`
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
      client_price.textContent = formatInteger(
        parseInt(data["client_total_price"])
      );
    }
    total_banquet_price.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";
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

    const detailsButton = document.querySelector(
      `.details-button[data-id="${client_id}"]`
    );
    if (detailsButton) {
      detailsButton.dataset.name = new_name;
    }
  } else if (action === "client_menu_deleted") {
    client_id = data["client_id"];
    menu_id = data["menu_id"];

    var MenuDivToRemove = document.querySelector(
      `.client-menu[data-id="${client_id}"]`
    );

    if (MenuDivToRemove) {
      while (MenuDivToRemove.firstChild) {
        MenuDivToRemove.removeChild(MenuDivToRemove.firstChild);
      }
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
      client_total_price.textContent = formatInteger(
        parseInt(data.client_total_price)
      );
    }
    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.current_banquet_id}"]`
    );
    total_banquet_price.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";
  } else if (action === "menu_added") {
    client_id = data["client_id"];
    current_menu_id = data["current_menu_id"];

    const dishes_data = JSON.parse(data["current_menu_dishes"]);

    var menuToRemove = document.querySelector(
      `div.client-menu[data-id="${client_id}"]`
    );
    // Проверяем, найден ли элемент, и удаляем его, если он найден
    if (menuToRemove) {
      while (menuToRemove.firstChild) {
        menuToRemove.removeChild(menuToRemove.firstChild);
      }
    }

    var menuDiv = document.querySelector(
      `.client-menu[data-id="${client_id}"]`
    );
    if (menuDiv) {
      menuDiv.setAttribute("data-id", client_id);
    }

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
    deleteButton.textContent = "Удалить";

    btnDiv.appendChild(menuHeader);
    btnDiv.appendChild(deleteButton);

    menuDiv.appendChild(btnDiv);

    // Массив с блюдами и ценами
    var totalCost = data["menu_total_price_count"];
    items = data["current_menu_dishes"];

    const client_id2 = data["client_id"];
    var current_banquet_id = data["current_banquet_id"];

    dishes_data.forEach(function (dish_data) {
      dish_data = JSON.parse(dish_data);

      const dish_id = dish_data["id"];
      const dish_name = dish_data["name"];
      const dish_tittle = dish_data["name"];
      const dish_weight = dish_data["weight"];
      const dish_price = dish_data["price"];
      const dish_sostav = dish_data["sostav"];
      const dish_type = dish_data["type"];
      const dish_image = dish_data["image"];
      var adittionalDish = `
      <div class="client-menu-dish">
    <div class="adittional-dish-item-img">
      <img class="client-img" data-id="${dish_id}" data-name="${dish_name}" data-tittle="${dish_tittle}" data-weight="${dish_weight}"
       data-price="${dish_price}.00" data-sostav="${dish_sostav}" data-type="${dish_type}"  data-client-id="${client_id2}"
       src="http://localhost:8000${dish_image}">
    </div>
    <div class="adittional-dish-item">
    ${dish_tittle} x 1<div class="client-order-price">
        <span class="client_order_price" data-id="${client_id2}">${formatInteger(
        parseInt(dish_price)
      )}</span>.00 ₽ ·
        <span class="dish-weight">${dish_weight} гр.</span>
      </div>
    </div>
    </div>
  `;

      var temp = document.createElement("div");
      temp.innerHTML += adittionalDish;
      menuDiv.append(temp);

      // var adittionalDish = document.querySelector(
      //   `.client-img[data-client-id="${client_id2}"][data-id="${dish_id}"]`
      // );

      // adittionalDish.addEventListener("click", handleDishImgClick);
    });

    var dottedLine = `<div class="dotted-line"></div>`;
    var temp = document.createElement("div");
    temp.innerHTML += dottedLine;
    menuDiv.append(temp);
    var current_client_id = localStorage.getItem("current_client_id");

    var client_menu_total_price = document.querySelector(
      'span.order-price-count[data-id="' + data.client_id + '"]'
    );
    if (client_menu_total_price) {
      client_menu_total_price.textContent = parseInt(totalCost);
    }

    var client_price_count = document.querySelector(
      'span.client-price-count[data-id="' + data.client_id + '"]'
    );
    if (client_price_count) {
      client_price_count.textContent = formatInteger(
        parseInt(data.client_total_price)
      );
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
      client_total_price.textContent = formatInteger(
        parseInt(data.client_total_price)
      );
    }

    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.current_banquet_id}"]`
    );
    total_banquet_price.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";

    function handleDeleteMenuButtonClick2(button) {
      const menu_id = button.dataset.id; // Получаем значение data-id из атрибута data-id
      var username_id = localStorage.getItem("username_id");
      var current_client_id = localStorage.getItem("current_client_id");
      ChangeBanquetData({
        action: "client_menu_delete",
        menu_id: menu_id,
        current_user_id: username_id,
        client_id: current_client_id,
      });
    }

    const menuDeleteButton = document.querySelector(
      `.delete-menu-btn[data-clientid="${client_id}"]`
    );
    menuDeleteButton.addEventListener("click", function (event) {
      handleDeleteMenuButtonClick2(event.target); // Передаем кнопку как аргумент
    });
  } else if (action === "menu_sep_added") {
    const all_dishes = data["all_dishes"];
    all_dishes.forEach(function (dish_data) {
      dish_data = JSON.parse(dish_data);
      if (dish_data["action"] == "dish_added") {
        var newQuantity = dish_data["client_dishOrder_quantity"];
        var current_dish_order_id = dish_data["current_dish_order_id"];

        var clientContainer = document.getElementById(dish_data.client_id);
        if (clientContainer) {
          const clientOrderPriceElement = document.querySelector(
            `span.client_order_price[id="${current_dish_order_id}"]`
          );

          clientOrderPriceElement.textContent = formatInteger(
            parseInt(dish_data.client_dishOrder_price_count)
          );

          const clientOrderQuantity = document.querySelector(
            `span.client_order_quantity[id="${current_dish_order_id}"]`
          );

          if (clientOrderQuantity) {
            clientOrderQuantity.textContent = newQuantity;
          }

          const clientOrderQuantity2 = document.querySelector(
            `span.dish-number-input[data-dish-id="${current_dish_order_id}"]`
          );
          if (clientOrderQuantity2) {
            clientOrderQuantity2.textContent = newQuantity;
          }
        }
      } else if (dish_data["action"] == "new_dish_added") {
        var client_id = localStorage.getItem("current_client_id");
        var newDiv = document.createElement("div");
        div_name = "client-orders-" + dish_data["current_dish_order_id"];
        newDiv.classList.add(div_name);

        const additional_dishes = document.querySelector(
          `.additional-dishes[data-id="${client_id}"]`
        );
        if (dish_data["is_first"]) {
          var additionalDishesSign = `
        <div class="additional-dishes-sign">
          Выбранные отдельно блюда
          <button class="clear-additional-btn" data-id="${dish_data["client_id"]}">
            Очистить
          </button>
        </div>
      `;
          var temp2 = document.createElement("div");
          temp2.innerHTML += additionalDishesSign;
          additional_dishes.append(temp2);
        }

        const client_id2 = dish_data["client_id"];
        const order_id = dish_data["current_dish_order_id"];
        const order_quantity = dish_data["client_dishOrder_quantity"];

        const dish_data2 = JSON.parse(dish_data["current_dish_data"]);
        const dish_id = dish_data2["id"];
        const dish_name = dish_data2["name"];
        const dish_tittle = dish_data2["name"];
        const dish_weight = dish_data2["weight"];
        const dish_price = dish_data2["price"];
        const dish_sostav = dish_data2["sostav"];
        const dish_type = dish_data2["type"];
        const dish_image = dish_data2["image"];
        const dish_image_decoded = decodeURIComponent(dish_image);
        var adittionalDish = `
      <div class="adittional-dish" data-id="${order_id}">
    <div class="adittional-dish-item-img">
      <img class="client-img additional" data-id="${dish_id}" data-name="${dish_name}" data-tittle="${dish_tittle}" data-weight="${dish_weight}"
       data-price="${dish_price}.00" data-sostav="${dish_sostav}" data-type="${dish_type}" data-client-id="${client_id2}"
       src="http://localhost:8000${dish_image}">
    </div>
    <div class="adittional-dish-item">
    ${dish_tittle}
      <div class="client-order-price">
        <span class="client_order_price" data-id="${client_id2}" data-order-id="${order_id}" id="${order_id}">${formatInteger(
          parseInt(dish_price)
        )}</span>.00 ₽ ·
        <span class="dish-weight">${dish_weight} гр.</span>
      </div>
    </div>
    <div class="adittional-dish-item-button">
      <div class="delete-btn-wrapper">
        <div class="delete-btn-wrapper2">
          <button class="decrease-btn" data-id="${order_id}" data-clientid="${client_id2}">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="decrease-btn-svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6 12a1 1 0 0 0 1 1h10a1 1 0 1 0 0-2H7a1 1 0 0 0-1 1Z" fill="currentColor"></path>
            </svg>
          </button>
          <span class="dish-number-input" data-id="${order_id}" data-dish-id="${order_id}" type="text" value="">${order_quantity}</span>
          <button class="increase-btn" data-id="${order_id}" data-clientid="${client_id2}">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="increase-btn-svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6a1 1 0 0 0-1 1v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7a1 1 0 0 0-1-1Z" fill="currentColor"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    </div>
  `;

        var temp = document.createElement("div");
        temp.innerHTML += adittionalDish;
        additional_dishes.append(temp);

        // var adittionalDish = document.querySelector(
        //   `.client-img[data-client-id="${client_id2}"][data-id="${dish_id}"].additional`
        // );

        // adittionalDish.addEventListener("click", handleDishImgClick);

        var additionalDishesSignBtn = document.querySelector(
          `.clear-additional-btn[data-id="${data["client_id"]}"]`
        );

        additionalDishesSignBtn.addEventListener(
          "click",
          handleClearAdditionalBtnClick
        );

        var decreaseBtn = document.querySelector(
          `.decrease-btn[data-id="${order_id}"]`
        );
        decreaseBtn.addEventListener("click", () => {
          const order_id = decreaseBtn.dataset.id;
          const client_id = decreaseBtn.dataset.clientid;
          ChangeBanquetData({
            action: "additional_order_decrease",
            order_id: order_id,
            client_id: client_id,
            current_client_id: client_id,
            current_user_id: current_user_id,
          });
        });
        var increaseBtn = document.querySelector(
          `.increase-btn[data-id="${order_id}"]`
        );
        increaseBtn.addEventListener("click", () => {
          const order_id = increaseBtn.dataset.id;
          const client_id = increaseBtn.dataset.clientid;
          ChangeBanquetData({
            action: "additional_order_increase",
            order_id: order_id,
            client_id: client_id,
            current_client_id: client_id,
            current_user_id: current_user_id,
          });
        });
      }
    });

    const OrderTotalPrice = document.querySelector(
      `span.order-price-count[data-id="${data.client_id}"]`
    );

    if (OrderTotalPrice) {
      OrderTotalPrice.textContent = formatInteger(
        parseInt(data.order_total_price)
      );
    }

    const order_total_price = document.querySelector(
      `span.order-price-count[data-id="${data.client_id}"]`
    );

    if (order_total_price) {
      order_total_price.textContent = formatInteger(
        parseInt(data.order_total_price)
      );
    }

    const client_price_count = document.querySelector(
      `span.client-price-count[data-id="${data.client_id}"]`
    );
    if (client_price_count) {
      client_price_count.textContent = formatInteger(
        parseInt(data.client_total_price)
      );
    }

    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.current_banquet_id}"]`
    );
    total_banquet_price.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";
  } else if (action === "new_additional_dish_added") {
    var dish_data = data["current_dish_data"];
    dish_data = JSON.parse(dish_data);
    var client_id = localStorage.getItem("current_client_id");
    var current_banquet_id = data["current_banquet_id"];

    const additional_dishes = document.querySelector(
      `.additional-dishes[data-banquet-id="${current_banquet_id}"]`
    );
    if (data["is_first"]) {
      var additionalDishesSign2 = `
        <div class="additional-dishes-sign">
            Выбранное дополнительно
          <button class="clear-additional-btn-additional" data-id="${current_banquet_id}">
            Очистить
          </button>
        </div>
      `;
      var temp3 = document.createElement("div");
      temp3.innerHTML += additionalDishesSign2;
      additional_dishes.append(temp3);
    }

    const client_id2 = data["client_id"];
    const order_id = data["current_dish_order_id"];
    const order_quantity = data["client_dishOrder_quantity"];

    const dish_id = dish_data["id"];
    const dish_name = dish_data["name"];
    const dish_tittle = dish_data["name"];
    const dish_weight = dish_data["weight"];
    const dish_price = dish_data["price"];
    const dish_sostav = dish_data["sostav"];
    const dish_type = dish_data["type"];
    const dish_image = dish_data["image"];
    const dish_image_decoded = decodeURIComponent(dish_image);
    var adittionalDish = `
      <div class="adittional-dish" data-id="${order_id}">
    <div class="adittional-dish-item-img">
      <img class="client-img" data-id="${dish_id}" data-name="${dish_name}" data-tittle="${dish_tittle}" data-weight="${dish_weight}"
       data-price="${dish_price}.00" data-sostav="${dish_sostav}" data-type="${dish_type}" data-client-id="${client_id2}"
       src="http://localhost:8000${dish_image}">
    </div>
    <div class="adittional-dish-item">
    ${dish_tittle}
      <div class="client-order-price">
        <span class="client_order_price" data-id="${client_id2}" data-order-id="${order_id}" id="${order_id}">${formatInteger(
      parseInt(dish_price)
    )}</span>.00 ₽ ·
        <span class="dish-weight">${dish_weight} гр.</span>
      </div>
    </div>
    <div class="adittional-dish-item-button-additional">
        <div class="delete-btn-wrapper2-additional">
          <button class="decrease-btn-adittional" data-id="${order_id}" data-banquetid="${current_banquet_id}">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="decrease-btn-svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6 12a1 1 0 0 0 1 1h10a1 1 0 1 0 0-2H7a1 1 0 0 0-1 1Z" fill="currentColor"></path>
            </svg>
          </button>
          <input class="dish-number-input-adittional" data-id="${current_banquet_id}" data-dish-id="${order_id}" type="text" value="${order_quantity}"></input>
          <button class="increase-btn-adittional" data-id="${order_id}" data-banquetid="${current_banquet_id}">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="increase-btn-svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6a1 1 0 0 0-1 1v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7a1 1 0 0 0-1-1Z" fill="currentColor"></path>
            </svg>
          </button>
        </div>
        <button class="delete-additional-btn" data-id="${order_id}">
              <img data-id="${order_id}" class="musorka-additional" src="/static/images/trashcan.png" alt="delete">
        </button>
    </div>
    </div>
  `;

    var temp = document.createElement("div");
    temp.innerHTML += adittionalDish;
    additional_dishes.append(temp);

    // var adittionalDish = document.querySelector(
    //   `.client-img[data-client-id="${client_id2}"][data-id="${dish_id}"]`
    // );
    // adittionalDish.addEventListener("click", handleDishImgClick);

    var additionalDishesSignBtn2 = document.querySelector(
      `.clear-additional-btn-additional[data-id="${current_banquet_id}"]`
    );

    additionalDishesSignBtn2.addEventListener(
      "click",
      handleClearBanquetAdditionalBtnClick
    );

    var decreaseBtn = document.querySelector(
      `.decrease-btn-adittional[data-id="${order_id}"]`
    );
    if (decreaseBtn) {
      decreaseBtn.addEventListener("click", () => {
        const order_id = decreaseBtn.dataset.id;
        const client_id = decreaseBtn.dataset.clientid;
        ChangeBanquetData({
          action: "additional_order_decrease_additional",
          order_id: order_id,
          client_id: client_id,
          current_client_id: client_id,
          current_user_id: current_user_id,
        });
      });
    }

    var increaseBtn = document.querySelector(
      `.increase-btn-adittional[data-id="${order_id}"]`
    );
    if (increaseBtn) {
      increaseBtn.addEventListener("click", () => {
        const order_id = increaseBtn.dataset.id;
        const client_id = increaseBtn.dataset.clientid;
        ChangeBanquetData({
          action: "additional_order_increase_additional",
          order_id: order_id,
          client_id: client_id,
          current_client_id: client_id,
          current_user_id: current_user_id,
        });
      });
    }

    var deleteBtn = document.querySelector(
      `.delete-additional-btn[data-id="${order_id}"]`
    );
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        const order_id = deleteBtn.dataset.id;
        ChangeBanquetData({
          action: "additional_order_delete",
          order_id: order_id,
          current_user_id: current_user_id,
        });
      });
    }

    var dishNumberInputAdittional = document.querySelector(
      `.dish-number-input-adittional[data-dish-id="${order_id}"]`
    );
    if (dishNumberInputAdittional) {
      dishNumberInputAdittional.addEventListener("input", function () {
        const current_user_id = localStorage.getItem("username_id");
        var currentValue = $(this).val();
        var order_id = dishNumberInputAdittional.getAttribute("data-dish-id");
        // Удаление всех символов, кроме цифр
        currentValue = currentValue.replace(/\D/g, "");

        // Проверяем длину введенного текста
        if (currentValue.length > 4) {
          // Если длина больше максимальной, обрезаем текст до максимальной длины
          currentValue = 3500;
        }

        const quantity = Math.min(3500, Math.max(0, currentValue)); // Ограничиваем значение до 2000
        $(this).val(quantity); // Обновляем значение поля ввода

        ChangeBanquetData({
          action: "additional_order_quantity_change",
          current_user_id: current_user_id,
          new_quantity: quantity,
          order_id: order_id,
        });
      });
    }

    var AddPrice = document.querySelector(`.order-price-count-additional`);
    AddPrice.textContent = formatInteger(parseInt(data["additional_price"]));
  } else if (action == "new_dish_added") {
    var dish_data = data["current_dish_data"];
    dish_data = JSON.parse(dish_data);
    var client_id = localStorage.getItem("current_client_id");
    var newDiv = document.createElement("div");
    div_name = "client-orders-" + data.current_dish_order_id;
    newDiv.classList.add(div_name);

    const additional_dishes = document.querySelector(
      `.additional-dishes[data-id="${client_id}"]`
    );
    if (data["is_first"]) {
      var additionalDishesSign = `
        <div class="additional-dishes-sign">
          Выбранные отдельно блюда
          <button class="clear-additional-btn" data-id="${data["client_id"]}">
            Очистить
          </button>
        </div>
      `;
      var temp2 = document.createElement("div");
      temp2.innerHTML += additionalDishesSign;
      additional_dishes.append(temp2);
    }

    const client_id2 = data["client_id"];
    const order_id = data["current_dish_order_id"];
    const order_quantity = data["client_dishOrder_quantity"];

    const dish_id = dish_data["id"];
    const dish_name = dish_data["name"];
    const dish_tittle = dish_data["name"];
    const dish_weight = dish_data["weight"];
    const dish_price = dish_data["price"];
    const dish_sostav = dish_data["sostav"];
    const dish_type = dish_data["type"];
    const dish_image = dish_data["image"];
    const dish_image_decoded = decodeURIComponent(dish_image);
    var adittionalDish = `
      <div class="adittional-dish" data-id="${order_id}">
    <div class="adittional-dish-item-img">
      <img class="client-img additional" data-id="${dish_id}" data-name="${dish_name}" data-tittle="${dish_tittle}" data-weight="${dish_weight}"
       data-price="${dish_price}.00" data-sostav="${dish_sostav}" data-type="${dish_type}" data-client-id="${client_id2}"
       src="http://localhost:8000${dish_image}">
    </div>
    <div class="adittional-dish-item">
    ${dish_tittle}
      <div class="client-order-price">
        <span class="client_order_price" data-id="${client_id2}" data-order-id="${order_id}" id="${order_id}">${formatInteger(
      parseInt(dish_price)
    )}</span>.00 ₽ ·
        <span class="dish-weight">${dish_weight} гр.</span>
      </div>
    </div>
    <div class="adittional-dish-item-button">
      <div class="delete-btn-wrapper">
        <div class="delete-btn-wrapper2">
          <button class="decrease-btn" data-id="${order_id}" data-clientid="${client_id2}">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="decrease-btn-svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6 12a1 1 0 0 0 1 1h10a1 1 0 1 0 0-2H7a1 1 0 0 0-1 1Z" fill="currentColor"></path>
            </svg>
          </button>
          <span class="dish-number-input" data-id="${order_id}" data-dish-id="${order_id}" type="text" value="">${order_quantity}</span>
          <button class="increase-btn" data-id="${order_id}" data-clientid="${client_id2}">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="increase-btn-svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6a1 1 0 0 0-1 1v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7a1 1 0 0 0-1-1Z" fill="currentColor"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    </div>
  `;

    var temp = document.createElement("div");
    temp.innerHTML += adittionalDish;
    additional_dishes.append(temp);

    // var adittionalDish = document.querySelector(
    //   `.client-img[data-client-id="${client_id2}"][data-id="${dish_id}"].additional`
    // );
    // adittionalDish.addEventListener("click", handleDishImgClick);

    var additionalDishesSignBtn = document.querySelector(
      `.clear-additional-btn[data-id="${data["client_id"]}"]`
    );

    additionalDishesSignBtn.addEventListener(
      "click",
      handleClearAdditionalBtnClick
    );

    var decreaseBtn = document.querySelector(
      `.decrease-btn[data-id="${order_id}"]`
    );
    decreaseBtn.addEventListener("click", () => {
      const order_id = decreaseBtn.dataset.id;
      const client_id = decreaseBtn.dataset.clientid;
      ChangeBanquetData({
        action: "additional_order_decrease",
        order_id: order_id,
        client_id: client_id,
        current_client_id: client_id,
        current_user_id: current_user_id,
      });
    });
    var increaseBtn = document.querySelector(
      `.increase-btn[data-id="${order_id}"]`
    );
    increaseBtn.addEventListener("click", () => {
      const order_id = increaseBtn.dataset.id;
      const client_id = increaseBtn.dataset.clientid;
      ChangeBanquetData({
        action: "additional_order_increase",
        order_id: order_id,
        client_id: client_id,
        current_client_id: client_id,
        current_user_id: current_user_id,
      });
    });
  } else if (action == "dish_added") {
    var newQuantity = data.client_dishOrder_quantity;
    var current_dish_order_id = data.current_dish_order_id;

    var clientContainer = document.getElementById(data.client_id);
    if (clientContainer) {
      const clientOrderPriceElement = document.querySelector(
        `span.client_order_price[id="${current_dish_order_id}"]`
      );

      clientOrderPriceElement.textContent = formatInteger(
        parseInt(data.client_dishOrder_price_count)
      );

      const clientOrderQuantity = document.querySelector(
        `span.client_order_quantity[id="${current_dish_order_id}"]`
      );

      if (clientOrderQuantity) {
        clientOrderQuantity.textContent = newQuantity;
      }

      const clientOrderQuantity2 = document.querySelector(
        `span.dish-number-input[data-dish-id="${current_dish_order_id}"]`
      );
      if (clientOrderQuantity2) {
        clientOrderQuantity2.textContent = newQuantity;
      }
    }
  } else if (action == "additional_order_deleted") {
    var adittionalDish = document.querySelector(
      `.adittional-dish[data-id="${data["current_dish_order_id"]}"]`
    );
    if (adittionalDish) {
      adittionalDish.remove();
    }

    if (data.is_left == false) {
      var clientAdditional = document.querySelector(
        `.additional-dishes[data-banquet-id="${data.current_banquet_id}"]`
      );
      while (clientAdditional.firstChild) {
        clientAdditional.removeChild(clientAdditional.firstChild);
      }
    }
    var orderPriceCountAdditional = document.querySelector(
      `.order-price-count-additional[data-id="${data["current_banquet_id"]}"`
    );
    orderPriceCountAdditional.textContent = formatInteger(
      parseInt(data["current_banquet_additional_price"][0])
    );
    var banquetTotalPrice = document.querySelector(
      `.banquet-total-price[data-id="${data["current_banquet_id"]}"]`
    );
    banquetTotalPrice.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";
  } else if (
    action == "additional_order_increased" ||
    action == "additional_order_decreased"
  ) {
    client_id = data["client_id"];
    dishOrder_id = data["current_dish_order_id"];
    new_quantity = data["new_quantity"];
    current_banquet_id = data["current_banquet_id"];
    const DishNumberInput = document.querySelector(
      `.dish-number-input[data-dish-id="${dishOrder_id}"]`
    );
    const DishNumberInput2 = document.querySelector(
      `.dish-number-input2[data-dish-id="${dishOrder_id}"]`
    );
    const clientOrderQuantity = document.getElementById(dishOrder_id);
    clientOrderQuantity.textContent = new_quantity;
    if (DishNumberInput) {
      DishNumberInput.textContent = formatInteger(parseInt(new_quantity));
    }

    if (DishNumberInput2) {
      DishNumberInput2.textContent = new_quantity;
    }

    const dish_order_price = document.querySelector(
      `.client_order_price[data-order-id="${dishOrder_id}"]`
    );
    dish_order_price.textContent = formatInteger(
      parseInt(data["current_dish_order_price_count"])
    );

    const orderPriceCount = document.getElementById(client_id);
    orderPriceCount.textContent = formatInteger(
      parseInt(data["order_total_price"])
    );

    const clientPriceCount = document.querySelector(
      `.client-price-count[data-id="${client_id}"]`
    );
    clientPriceCount.textContent = formatInteger(
      parseInt(data["client_total_price"])
    );

    const banquetTotalPrice = document.getElementById(current_banquet_id);
    banquetTotalPrice.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";

    const dishNumberInput2 = document.querySelectorAll(
      `.dish-number-input2[data-dish-id="${dishOrder_id}"]`
    );
    if (dishNumberInput2) {
      dishNumberInput2.forEach(function (dishNumberInput) {
        dishNumberInput.textContent = new_quantity;
      });
    }
  } else if (action == "client_additional_cleared") {
    const additionalDishes = document.querySelector(
      `.additional-dishes[data-id="${data["client_id"]}"]`
    );
    if (additionalDishes) {
      while (additionalDishes.firstChild) {
        additionalDishes.removeChild(additionalDishes.firstChild);
      }
    }

    const OrderTotalPrice = document.querySelector(
      `span.order-price-count[data-id="${data.client_id}"]`
    );

    if (OrderTotalPrice) {
      OrderTotalPrice.textContent = formatInteger(
        parseInt(data.order_total_price)
      );
    }

    const order_total_price = document.querySelector(
      `span.order-price-count[data-id="${data.client_id}"]`
    );

    if (order_total_price) {
      order_total_price.textContent = formatInteger(
        parseInt(data.order_total_price)
      );
    }

    const client_price_count = document.querySelector(
      `span.client-price-count[data-id="${data.client_id}"]`
    );
    if (client_price_count) {
      client_price_count.textContent = formatInteger(
        parseInt(data.client_total_price)
      );
    }

    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.current_banquet_id}"]`
    );
    total_banquet_price.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";
  } else if (action == "banquet_additional_cleared") {
    const additionalDishes = document.querySelector(
      `.additional-dishes[data-banquet-id="${data["current_banquet_id"]}"]`
    );
    if (additionalDishes) {
      while (additionalDishes.firstChild) {
        additionalDishes.removeChild(additionalDishes.firstChild);
      }
    }
    var additional_order_price = document.querySelector(
      `.order-price-count-additional[data-id="${data.current_banquet_id}"]`
    );
    additional_order_price.textContent = formatInteger(
      parseInt(data.additinal_price)
    );

    var banquet_total = document.querySelector(`.banquet-total-price`);
    banquet_total.textContent =
      formatInteger(parseInt(data.total_banquet_price)) + ".00 ₽";
  } else if (
    action == "additional_order_increased_additional" ||
    action == "additional_order_decreased_additional"
  ) {
    var current_dish_order_id = data["current_dish_order_id"];
    var dishNumberInputAdittional = document.querySelector(
      `input.dish-number-input-adittional[data-dish-id="${current_dish_order_id}"]`
    );
    if (dishNumberInputAdittional) {
      dishNumberInputAdittional.value = data["new_quantity"];
    }
    var dishNumberInputAdittional2 = document.querySelector(
      `span.dish-number-input2[data-dish-id="${current_dish_order_id}"]`
    );
    var dishNumberInputAdittional2Additional = document.querySelector(
      `input.dish-number-input2-additional[data-dish-id="${current_dish_order_id}"]`
    );
    if (dishNumberInputAdittional2) {
      dishNumberInputAdittional2.textContent = data["new_quantity"];
    }
    if (dishNumberInputAdittional2Additional) {
      dishNumberInputAdittional2Additional.value = data["new_quantity"];
    }

    var client_order_price = document.querySelector(
      `.client_order_price[data-order-id="${data.current_dish_order_id}"]`
    );
    client_order_price.textContent = formatInteger(
      parseInt(data.current_dish_order_price_count)
    );

    var additional_order_price = document.querySelector(
      `.order-price-count-additional[data-id="${data.current_banquet_id}"]`
    );
    additional_order_price.textContent = formatInteger(
      parseInt(data.additinal_price)
    );

    var banquet_total = document.querySelector(`.banquet-total-price`);
    banquet_total.textContent =
      formatInteger(parseInt(data.total_banquet_price)) + ".00 ₽";
  }
  if (
    action == "dish_added" ||
    action == "new_dish_added" ||
    action == "new_additional_dish_added" ||
    action == "recalc_after_changing"
  ) {
    const OrderTotalPrice = document.querySelector(
      `span.order-price-count[data-id="${data.client_id}"]`
    );

    if (OrderTotalPrice) {
      OrderTotalPrice.textContent = formatInteger(
        parseInt(data.order_total_price)
      );
    }

    const order_total_price = document.querySelector(
      `span.order-price-count[data-id="${data.client_id}"]`
    );

    if (order_total_price) {
      order_total_price.textContent = formatInteger(
        parseInt(data.order_total_price)
      );
    }

    const client_price_count = document.querySelector(
      `span.client-price-count[data-id="${data.client_id}"]`
    );
    if (client_price_count) {
      client_price_count.textContent = formatInteger(
        parseInt(data.client_total_price)
      );
    }

    const total_banquet_price = document.querySelector(
      `.banquet-total-price[data-id="${data.current_banquet_id}"]`
    );
    total_banquet_price.textContent =
      formatInteger(parseInt(data["total_banquet_price"])) + ".00 ₽";

    const current_dish_id = data["current_dish_id"];
    orderButtonToDelete = document.querySelector(
      `.order-button[data-id="${current_dish_id}"]`
    );
    if (orderButtonToDelete) {
      orderButtonToDelete.remove();
    }

    const container = document.querySelector(
      `.order-btn-container[data-id="${current_dish_id}"]`
    );
    CreateQuantityStatusButton(
      container,
      data.client_id,
      data.current_dish_order_id,
      1
    );
    const is_addit = localStorage.getItem("is_additional");
    if (is_addit == "false") {
      const container2 = document.querySelector(
        `.order-btn-container2[data-id="${current_dish_id}"]`
      );
      const orderButtonToDelete2 = document.querySelector(
        `.order-button-mod[data-id="${current_dish_id}"]`
      );
      if (orderButtonToDelete2) {
        orderButtonToDelete2.style.display = "none";
      }
      CreateQuantityStatusButton(
        container2,
        data.client_id,
        data.current_dish_order_id,
        1
      );
    }
  }
}
