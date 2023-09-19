$("button.dish-filter").on("click", function () {
  var filter = $(this).data("filter");
  localStorage.setItem("dish-filter", filter);

  LoadMenu(filter);
});

$("button.menu-filter").on("click", function () {
  var filter = "samples";
  var menu_filter = $(this).data("filter");
  localStorage.setItem("dish-filter", filter);
  localStorage.setItem("menu-filter", menu_filter);
  LoadMenu(filter, null, menu_filter);
});

var to_delete = document.querySelector(`.dish-filter[data-filter="samples"]`);

function QauntityStatusMod(container = null, dish_id) {
  const client_id = localStorage.getItem("current_client_id");
  var requestParams = {
    dish_id: dish_id,
    client_id: client_id,
  };

  $.ajax({
    url: "http://127.0.0.1:8000/api/QauntityStatusMod/",
    method: "GET",
    data: requestParams,
    dataType: "json",
    success: function (data) {
      data = JSON.parse(data);
      console.log(data);
      var quantity = data["current_quantity"];
      var current_dish_order_id = data["current_dish_order_id"];
      CreateQuantityStatusButton(
        container,
        client_id,
        current_dish_order_id,
        quantity,
        false,
        data["dish_id"],
        data["dish_name"]
      );
    },
    error: function (xhr, status, error) {
      console.error(error);
    },
  });
}

function DeleteQuantityButton(dish_id, dish_name) {
  const current_client_name = localStorage.getItem("current_client_name");
  var orderButton = $("<button>", {
    class: "order-button",
    "data-id": dish_id,
    "data-name": dish_name,
  }).text(`Выбрать для "${current_client_name}"`);

  var orderButton2 = $("<button>", {
    class: "order-button-mod",
    "data-id": dish_id,
    "data-name": current_client_name,
  }).text(`Выбрать для "${current_client_name}"`);

  var orderButtonContainer = $(`.order-btn-container[data-id="${dish_id}"]`);
  var orderButtonContainer2 = $(`.order-btn-container2[data-id="${dish_id}"]`);
  orderButtonContainer.empty();
  orderButtonContainer2.empty();
  orderButtonContainer.append(orderButton);
  orderButtonContainer2.append(orderButton2);

  const orderButtonToAddListener = document.querySelector(
    `.order-button[data-id="${dish_id}"]`
  );
  const orderButtonToAddListener2 = document.querySelector(
    `.order-button-mod[data-id="${dish_id}"]`
  );
  if (orderButtonToAddListener) {
    AddBtnAnimation(orderButtonToAddListener);
  }
  if (orderButtonToAddListener2) {
    AddBtnAnimation(orderButtonToAddListener2);
  }

  var is_addit = localStorage.getItem("is_additional");
  if (is_addit == "true") {
    orderButtonToAddListener.addEventListener("click", function () {
      handleButtonClickAddittional(this);
    });
    if (orderButtonToAddListener2) {
      orderButtonToAddListener2.addEventListener("click", function () {
        handleButtonClickAddittional(this);
      });
    }
  } else {
    if (orderButtonToAddListener) {
      orderButtonToAddListener.addEventListener("click", function () {
        handleButtonClick(this);
      });
    }

    if (orderButtonToAddListener2) {
      orderButtonToAddListener2.addEventListener("click", function () {
        handleButtonClick(this);
      });
    }
  }

  if (orderButtonToAddListener) {
    orderButtonToAddListener.addEventListener("click", function () {
      AddBtnAnimation(this);
    });
  }

  if (orderButtonToAddListener2) {
    orderButtonToAddListener2.addEventListener("click", function () {
      AddBtnAnimation(this);
    });
  }
}
