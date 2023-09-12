ymaps.ready(function () {
  var myMap = new ymaps.Map("map", {
    center: [58.1, 56.24],
    zoom: 10,
    options: {
      iconCursor: "arrow",
    },
  });
  var cursor = myMap.cursors.push("pointer");
  var previousPlacemark = null;
  myMap.events.add("click", function (e) {
    if (previousPlacemark) {
      myMap.geoObjects.remove(previousPlacemark);
    }

    var coords = e.get("coords");
    localStorage.setItem("current_coords", coords);
    ymaps.geocode(coords).then(function (res) {
      // Получаем первый результат геокодирования
      var firstGeoObject = res.geoObjects.get(0);

      // Извлекаем адрес и выводим его
      var address = firstGeoObject.getAddressLine();
      localStorage.setItem("address", address);
      const current_addres = document.querySelector(`.addres-details`);
      if (current_addres) {
        current_addres.textContent = address;
      }
    });
    var myPlacemark = new ymaps.Placemark(
      coords,
      {
        // Ваш контент для метки, например, подсказка.
        hintContent: "Метка здесь!",
      },
      {
        // Опции для метки, если необходимо.
        // Например, устанавливаем курсор в виде стрелки.
        iconLayout: "default#image",
        iconImageHref: "/static/images/cursor.png", // Путь к изображению метки
        iconImageSize: [40, 40], // Размеры изображения метки
        iconImageOffset: [-32, -32], // Смещение изображения метки
        iconCursor: "grabbing",
        draggable: true,
      }
    );
    previousPlacemark = myPlacemark;
    myMap.geoObjects.add(myPlacemark);

    myPlacemark.events.add("drag", function (e) {
      cursor = myMap.cursors.push("grab");
    });
    myPlacemark.events.add("dragend", function (e) {
      cursor = myMap.cursors.push("pointer");
      localStorage.setItem(
        "current_coords",
        myPlacemark.geometry.getCoordinates()
      );
      var coords = myPlacemark.geometry.getCoordinates();
      ymaps.geocode(coords).then(function (res) {
        // Получаем первый результат геокодирования
        var firstGeoObject = res.geoObjects.get(0);
        var address = firstGeoObject.getAddressLine();
        localStorage.setItem("address", address);
        const current_addres = document.querySelector(`.addres-details`);
        if (current_addres) {
          current_addres.textContent = address;
        }
      });
    });
  });
});
