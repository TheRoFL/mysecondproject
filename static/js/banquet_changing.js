// JavaScript код для отображения/скрытия формы при нажатии на кнопку
const showFormButton = document.getElementById("showFormBtn");
const clientForm = document.getElementById("clientForm");
const cancelFormButton = document.getElementById("cancelFormBtn");

showFormButton.addEventListener("click", () => {
  CreateClient();
  username_id = localStorage.getItem("username_id");
  const data_to_send = {
    action: "added_client",
    clientName: "Шаблон клиента",
    clientCount: 0,
    current_user_id: username_id,
  };
  ChangeBanquetData(data_to_send);
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

  if (sum > 3500) {
    currentValue = 3500 - (sum - parseInt(currentValue));
  }

  // Проверяем длину введенного текста
  if (currentValue.length > 4) {
    // Если длина больше максимальной, обрезаем текст до максимальной длины
    currentValue = 3500;
  }

  const quantity = Math.min(3500, Math.max(0, currentValue)); // Ограничиваем значение до 2000
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
  ChangeBanquetData({
    action: "client_name_update",
    client_id: client_id,
    current_user_id: username_id,
    name: name,
  });
});

$(".name-input").on("change", function () {
  var currentValue = $(this).val();
  const client_id = $(this).data("id");

  if (currentValue.length == 0) {
    $(this).val("Шаблон клиента");
    const name = $(this).val();

    username_id = localStorage.getItem("username_id");
    $(this).val = currentValue.trim();
    ChangeBanquetData({
      action: "client_name_update",
      client_id: client_id,
      current_user_id: username_id,
      name: name,
    });
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
    button.addEventListener("click", handleButtonClick);
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

function handleDeleteClientButtonClick(event) {
  const client_id = event.target.dataset.id; // Получаем id клиента из атрибута data-id
  username_id = localStorage.getItem("username_id");
  current_client_id = localStorage.getItem("current_client_id");
  ChangeBanquetData({
    action: "client_delete",
    client_id: client_id,
    current_user_id: username_id,
    current_client_id: current_client_id,
  });
}

function handleDeleteMenuButtonClick(event) {
  const mybutton = event.target; // Получаем элемент, на котором произошло событие (в данном случае, кнопка)
  const menu_id = mybutton.dataset.id; // Получаем значение data-id из атрибута data-id
  var username_id = localStorage.getItem("username_id");
  var current_client_id = mybutton.dataset.clientid;
  ChangeBanquetData({
    action: "client_menu_delete",
    menu_id: menu_id,
    current_user_id: username_id,
    client_id: current_client_id,
  });
}

deleteButtons.forEach((button) => {
  button.addEventListener("click", handleDeleteClientButtonClick);
});

const increaseButtons = document.querySelectorAll(".increase-btn");
const decreaseButtons = document.querySelectorAll(".decrease-btn");
const current_user_id = localStorage.getItem("username_id");
increaseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const order_id = button.dataset.id;
    const client_id = button.dataset.clientid;
    ChangeBanquetData({
      action: "additional_order_increase",
      order_id: order_id,
      client_id: client_id,
      current_client_id: client_id,
      current_user_id: current_user_id,
    });
  });
});
decreaseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const order_id = button.dataset.id;
    const client_id = button.dataset.clientid;
    ChangeBanquetData({
      action: "additional_order_decrease",
      order_id: order_id,
      client_id: client_id,
      current_client_id: client_id,
      current_user_id: current_user_id,
    });
  });
});

// const client_imges = document.querySelectorAll(".client-img");
// var x, y;
// for (let i = 0; i < client_imges.length; i++) {
//   var div = `<div class = "overflow3 hidden" id="${
//     "overflow3" + client_imges[i].getAttribute("data-id")
//   }"></div>
//       <div class="modWind3 hidden" id="${
//         "modWind3" + client_imges[i].getAttribute("data-id")
//       }">
//         <div class="flex-mod-dish"><img class="dish-img-mod"
//         src="http://localhost:8000/media/menu_images/${client_imges[
//           i
//         ].getAttribute("data-type")}/${client_imges[i].getAttribute(
//     "data-tittle"
//   )}.png"
//         </div>
//         <div class="mod-dish-info3">
//           <div class="name">${client_imges[i].getAttribute("data-name")}</div>
//           <div class="grams">${client_imges[i].getAttribute(
//             "data-weight"
//           )} гр</div>
//           <div class="price">${client_imges[i].getAttribute(
//             "data-price"
//           )} руб</div>
//           <div class="sostav">${client_imges[i].getAttribute(
//             "data-sostav"
//           )}</div>
//         </div>
//     </div>
//     <div class="mod-dish-decription">
//     <div class="decription">Тут будет описание...</div>

//     </div>
//     `;

//   document.querySelector("body").insertAdjacentHTML("beforeend", div);

//   client_imges[i].addEventListener("click", () => {
//     client_imges[i].classList.add("active");
//     x = document.getElementById(
//       "overflow3" + client_imges[i].getAttribute("data-id")
//     );
//     y = document.getElementById(
//       "modWind3" + client_imges[i].getAttribute("data-id")
//     );

//     x.classList.remove("hidden");
//     y.classList.remove("hidden");

//     // my_client = document.querySelector(`.my_client[data-id="${client_imges[i].}"]`)
//   });

//   var exit = document.getElementById(
//     "overflow3" + client_imges[i].getAttribute("data-id")
//   );

//   exit.addEventListener("click", () => {
//     const current_dish = document.querySelector(`.client-img.active`);
//     if (current_dish) {
//       current_dish.classList.remove("active");
//     }

//     x = document.getElementById(
//       "overflow3" + client_imges[i].getAttribute("data-id")
//     );
//     y = document.getElementById(
//       "modWind3" + client_imges[i].getAttribute("data-id")
//     );
//     x.classList.add("hidden");
//     y.classList.add("hidden");
//   });
// }

const dish_search = document.getElementById(`dish-search`);

if (dish_search) {
  dish_search.addEventListener("input", function () {
    var currentValue = $(this).val();

    if (currentValue.length > 25) {
      $(this).val(currentValue.slice(0, 25));
      currentValue = $(this).val(currentValue.slice(0, 25));
    }

    var name = $(this).val();
    localStorage.setItem("search-request", currentValue);
    LoadMenu();
  });
}

function handleClearAdditionalBtnClick(event) {
  const client_id = event.target.dataset.id;
  username_id = localStorage.getItem("username_id");
  ChangeBanquetData({
    action: "client_additional_clear",
    client_id: client_id,
    current_user_id: username_id,
  });
}
const ClearAdditionalBtns = document.querySelectorAll(`.clear-additional-btn`);
ClearAdditionalBtns.forEach((button) => {
  button.addEventListener("click", handleClearAdditionalBtnClick);
});

banquetAdditionalDish = document.querySelector(`.banquet-additional-dish`);
if (banquetAdditionalDish) {
  banquetAdditionalDish.addEventListener("click", function () {
    banquetAdditionalDishes = document.querySelector(
      `.banquet-additional-dishes`
    );
    banquetAdditionalDishes.style.display = "none";
    // banquetAdditionalDish.remove();
  });
}

function handleClearBanquetAdditionalBtnClick(event) {
  const banquet_id = event.target.dataset.id;
  username_id = localStorage.getItem("username_id");
  ChangeBanquetData({
    action: "banquet_additional_clear",
    banquet_id: banquet_id,
    current_user_id: username_id,
  });
}
const ClearAdditionalBtn = document.querySelector(
  `.clear-additional-btn-additional`
);

if (ClearAdditionalBtn) {
  ClearAdditionalBtn.addEventListener(
    "click",
    handleClearBanquetAdditionalBtnClick
  );
}

var dishNumberInputsAittional = document.querySelectorAll(
  `.dish-number-input-adittional`
);

dishNumberInputsAittional.forEach((input) => {
  input.addEventListener("input", function () {
    const current_user_id = localStorage.getItem("username_id");
    var currentValue = $(this).val();
    var order_id = input.getAttribute("data-dish-id");
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
});

var is_addit__ = localStorage.getItem("is_additional");
var action = "additional_order_increase";
var action2 = "additional_order_decrease";
if (is_addit__ == "true") {
  var action = "additional_order_increase_additional";
  var action2 = "additional_order_decrease_additional";
}

var increaseAdittionalBtns = document.querySelectorAll(
  `.increase-btn-adittional`
);
increaseAdittionalBtns.forEach((increaseBtn) => {
  increaseBtn.addEventListener("click", () => {
    const order_id = increaseBtn.dataset.id;
    const client_id = increaseBtn.dataset.clientid;

    const dishNumberInputAdittional = document.querySelector(
      `.dish-number-input-adittional[data-dish-id="${order_id}"]`
    );
    if (dishNumberInputAdittional.value >= 3500) {
      dishNumberInputAdittional.textContent = 3500;
    } else {
      ChangeBanquetData({
        action: "additional_order_increase_additional",
        order_id: order_id,
        client_id: client_id,
        current_client_id: client_id,
        current_user_id: current_user_id,
      });
    }
  });
});

var decreaseAdittionalBtns = document.querySelectorAll(
  `.decrease-btn-adittional`
);
decreaseAdittionalBtns.forEach((decreaseBtn) => {
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
});

deleteAdditionalBtns = document.querySelectorAll(`.delete-additional-btn`);

if (deleteAdditionalBtns) {
  deleteAdditionalBtns.forEach((deleteAdditionalBtn) => {
    deleteAdditionalBtn.addEventListener("click", () => {
      const order_id = deleteAdditionalBtn.dataset.id;
      ChangeBanquetData({
        action: "additional_order_delete",
        order_id: order_id,
        current_user_id: current_user_id,
      });
    });
  });
}

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

var client_order_prices = document.querySelectorAll(`.client_order_price`);
if (client_order_prices) {
  client_order_prices.forEach((client_order_price) => {
    client_order_price.textContent = formatInteger(
      parseInt(client_order_price.textContent)
    );
  });
}

var orderPriceCountAdditional = document.querySelector(
  `.order-price-count-additional`
);
if (orderPriceCountAdditional) {
  orderPriceCountAdditional.textContent = formatInteger(
    parseInt(orderPriceCountAdditional.textContent)
  );
}

const menuButtons = document.querySelectorAll(".vash_zakaz");
const detailsButtons = document.querySelectorAll(".details-button");
const x1 = document.querySelector(".menuu");
const y1 = document.querySelector(".overflow2");

detailsButtons.forEach((button) => {
  button.addEventListener("click", function () {
    localStorage.setItem("is_additional", false);
    localStorage.setItem("current_client_id", button.dataset.id);
    localStorage.setItem("current_client_name", button.dataset.name);
    LoadMenu();
    menuButtons.forEach((button) => {
      var current_client_id = localStorage.getItem("current_client_id");
      var my_client_form = document.querySelector(
        `.my_client[data-id="${current_client_id}"]`
      );
      if (my_client_form) {
        my_client_form.classList.add("active");
      }
      button.classList.add("active");
    });
    x1.classList.remove("hidden2");
    y1.classList.remove("hidden2");
  });
});

const detailsButtonAdditional_ = document.querySelector(
  ".details-button-additional"
);
detailsButtonAdditional_.addEventListener("click", function () {
  localStorage.setItem("dish-filter", "all");
  LoadMenu();
  localStorage.setItem("is_additional", true);
  localStorage.setItem("current_client_name", "Дополнительные блюда");
  x1.classList.remove("hidden2");
  y1.classList.remove("hidden2");

  var my_client_additional = document.querySelector(
    `.my_client[data-id="additional"]`
  );
  my_client_additional.classList.add("active");
});

document.addEventListener("keydown", (e) => {
  if (e.code == "Escape") {
    x1.classList.add("hidden2");
    y1.classList.add("hidden2");
  }
});

y1.addEventListener("click", () => {
  var gridContainer = document.querySelector(".grid-container");
  var chosenClient = document.querySelector(".my_client.active");
  if (chosenClient) {
    chosenClient.classList.remove("active");
  }
  gridContainer.classList.remove("menu-mode");

  setTimeout(() => {
    gridContainer.classList.remove("appear");
  }, 1);
  x1.classList.add("hidden2");
  y1.classList.add("hidden2");

  var my_client_additional = document.querySelector(
    `.my_client[data-id="additional"]`
  );
  my_client_additional.classList.remove("active");
});

const orderingWindowOverflow = document.querySelector(
  `.ordering-window-overflow`
);
const confirmOrderModal = document.querySelector(`.ordering-window`);
orderingWindowOverflow.addEventListener("click", function () {
  orderingWindowOverflow.classList.add("hidden");
  confirmOrderModal.classList.add("hidden");
});

const confirmOrderModalBtn = document.querySelector(`.confirm-order-modal`);
confirmOrderModalBtn.addEventListener("click", function () {
  confirmOrderModal.classList.remove("hidden");
  orderingWindowOverflow.classList.remove("hidden");
});

var sorted_bys = document.querySelectorAll(`.filter-btn`);
sorted_bys.forEach(function (sorted_by) {
  sorted_by.addEventListener("click", function () {
    const buttonToUnHighlight = document.querySelectorAll(".filter-btn");
    buttonToUnHighlight.forEach((button) => {
      button.classList.remove("highlighted");
    });
    sorted_by.classList.add("highlighted");
    var filter = sorted_by.dataset.filter;
    localStorage.setItem("sorted_by", filter);

    LoadMenu();
  });
});

const surname_input = document.querySelector(`.surname-ordering-input`);
const name_input = document.querySelector(`.name-ordering-input`);
const patronymic_input = document.querySelector(`.patronymic-ordering-input`);
const phone_input = document.querySelector(`.phone-ordering-input`);
const email_input = document.querySelector(`.email-ordering-input`);
const start_day_input = document.querySelector(`.day-input`);
const start_month_input = document.querySelector(`.month-input`);
const start_year_input = document.querySelector(`.year-input`);
const start_time_input = document.querySelector(`.surname-ordering-input`);
const duration_time_input = document.querySelector(`.surname-ordering-input`);

surname_input.addEventListener("input", function () {
  var currentValue = $(this).val();
  $(this).val = currentValue.trim();

  if (currentValue.length > 15) {
    $(this).val(currentValue.slice(0, 15));
  }

  const surname = $(this).val();
  username_id = localStorage.getItem("username_id");
  ChangeBanquetData({
    action: "order_surname_update",
    current_user_id: username_id,
    surname: surname,
  });
});
name_input.addEventListener("input", function () {
  var currentValue = $(this).val();
  $(this).val = currentValue.trim();
  // Проверяем длину введенного текста
  if (currentValue.length > 15) {
    // Если длина больше максимальной, обрезаем текст до максимальной длины
    $(this).val(currentValue.slice(0, 15));
  }
  const name = $(this).val();
  username_id = localStorage.getItem("username_id");
  ChangeBanquetData({
    action: "order_name_update",
    current_user_id: username_id,
    name: name,
  });
});
patronymic_input.addEventListener("input", function () {
  var currentValue = $(this).val();
  $(this).val = currentValue.trim();
  // Проверяем длину введенного текста
  if (currentValue.length > 15) {
    // Если длина больше максимальной, обрезаем текст до максимальной длины
    $(this).val(currentValue.slice(0, 15));
  }
  const patronymic = $(this).val();
  username_id = localStorage.getItem("username_id");
  ChangeBanquetData({
    action: "order_patronymic_update",
    current_user_id: username_id,
    patronymic: patronymic,
  });
});
email_input.addEventListener("input", function () {
  var currentValue = $(this).val();
  $(this).val = currentValue.trim();
  // Проверяем длину введенного текста
  if (currentValue.length > 30) {
    // Если длина больше максимальной, обрезаем текст до максимальной длины
    $(this).val(currentValue.slice(0, 30));
  }
  const email = $(this).val();
  username_id = localStorage.getItem("username_id");
  ChangeBanquetData({
    action: "order_email_update",
    current_user_id: username_id,
    email: email,
  });
});
phone_input.addEventListener("input", function () {
  var currentValue = $(this).val();
  $(this).val = currentValue.trim();
  // Проверяем длину введенного текста
  if (currentValue.length > 15) {
    // Если длина больше максимальной, обрезаем текст до максимальной длины
    $(this).val(currentValue.slice(0, 15));
  }
  const phone = $(this).val();
  username_id = localStorage.getItem("username_id");
  ChangeBanquetData({
    action: "order_phone_update",
    current_user_id: username_id,
    phone: phone,
  });
});
