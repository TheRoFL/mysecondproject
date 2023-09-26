ymaps.ready(function () {
  var myMap = new ymaps.Map("map", {
    center: [58.1, 56.24],
    zoom: 10,
    options: {
      iconCursor: "arrow",
    },
  });
  cursor = myMap.cursors.push("pointer");

  var suggestView = new ymaps.SuggestView("suggest", {
    provider: {
      suggest: function (request, options) {
        return ymaps.suggest("Пермь, " + request);
      },
    },
  });
  var previousPlacemark = null;
  var addressPlacemark = null;

  suggestView.events.add("select", function (e) {
    var selectedItem = e.get("item");
    var address = selectedItem.displayName;

    localStorage.setItem("address", address);

    if (previousPlacemark) {
      myMap.geoObjects.remove(previousPlacemark);
    }

    if (addressPlacemark) {
      myMap.geoObjects.remove(addressPlacemark);
    }

    ymaps.geocode(address).then(function (res) {
      var coords = res.geoObjects.get(0).geometry.getCoordinates();
      localStorage.setItem("current_coords", coords);

      var currentZoom = myMap.getZoom();
      myMap.setCenter(coords, currentZoom);

      var myPlacemark = new ymaps.Placemark(
        coords,
        {
          hintContent: "Метка здесь!",
        },
        {
          iconLayout: "default#image",
          iconImageHref: "/static/images/cursor.png",
          iconImageSize: [40, 40],
          iconImageOffset: [-32, -32],
          iconCursor: "grabbing",
          draggable: true,
        }
      );

      addressPlacemark = myPlacemark;
      previousPlacemark = addressPlacemark;
      myMap.geoObjects.add(myPlacemark);

      myPlacemark.events.add("drag", function (e) {
        cursor = myMap.cursors.push("grab");
      });

      myPlacemark.events.add("dragend", function (e) {
        cursor = myMap.cursors.push("pointer");
        var coords = myPlacemark.geometry.getCoordinates();
        localStorage.setItem("current_coords", coords);

        ymaps.geocode(coords).then(function (res) {
          var firstGeoObject = res.geoObjects.get(0);
          var address = firstGeoObject.getAddressLine();
          localStorage.setItem("address", address);
          const currentAddress = document.querySelector(".addres-input");
          if (currentAddress) {
            currentAddress.value = address;
          }
        });
      });
    });
  });

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
      const current_addres = document.querySelector(".addres-input");
      if (current_addres) {
        current_addres.value = address;
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
        iconCursor: "grab",
        draggable: true,
      }
    );
    previousPlacemark = myPlacemark;
    myMap.geoObjects.add(myPlacemark);

    myPlacemark.events.add("drag", function (e) {
      cursor = myMap.cursors.push("grabbing");
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
        const current_addres = document.querySelector(".addres-input");
        if (current_addres) {
          current_addres.value = address;
        }
      });
    });
  });
});
