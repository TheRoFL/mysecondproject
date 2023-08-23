const duration_time = document.getElementById("duration_time");
duration_time.addEventListener("input", function () {
  var hours = $(this).val();

  // Удаление всех символов, кроме цифр
  hours = hours.replace(/\D/g, "");

  const quantity = Math.min(24, Math.max(0, hours)); // Ограничиваем значение до 2000
  $(this).val(quantity); // Обновляем значение поля ввода
  const hours_quantity = document.getElementById("hours_quantity");
  hours_quantity.textContent = quantity;
  requestParams = {
    hours: quantity,
  };
  $.ajax({
    url: "http://127.0.0.1:8000/banquet/ordering/",
    method: "GET",
    data: requestParams,
    dataType: "json",
    success: function (data) {
      data = JSON.parse(data);
      console.log(data);

      const total = document.getElementById("total");
      total.textContent = data["total"];
    },
    error: function (xhr, status, error) {
      console.error(error);
    },
  });
});
