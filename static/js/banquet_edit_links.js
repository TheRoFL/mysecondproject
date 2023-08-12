document.addEventListener("DOMContentLoaded", () => {
  const savedPosition = sessionStorage.getItem("scrollPosition");

  if (savedPosition) {
    // Прокручиваем страницу к сохраненной позиции
    window.scrollTo(0, savedPosition);

    // Удаляем сохраненную позицию прокрутки из sessionStorage
    sessionStorage.removeItem("scrollPosition");
  }
});
// Получаем все кнопки с классом "menu-client-btn"
const menuButtons = document.querySelectorAll(".menu-client-btn");

// Добавляем обработчик событий на каждую кнопку
menuButtons.forEach((button) => {
  // Получаем значение атрибута data-id у каждой кнопки (client.id)
  const clientId = button.getAttribute("data-id");

  // Добавляем обработчик событий на нажатие кнопки
  button.addEventListener("click", () => {
    const currentPosition = window.scrollY;
    sessionStorage.setItem("scrollPosition", currentPosition);
    var currentUrl = window.location.href;

    // Парсируем параметры текущего URL
    const urlObject = new URL(currentUrl);
    dish_filter = urlObject.searchParams.get("dish-filter");

    window.location.href =
      `/banquet/?editting-clientId=${clientId}` + "&dish-filter=" + dish_filter;
    window.scrollTo(0, scrollTop);
  });

  // Проверяем текущий URL и сравниваем с целевой ссылкой
  const currentUrl = window.location.pathname.replace(/\/$/, ""); // Удаляем последний слеш, если есть
  const targetUrl = `/banquet/?editting-clientId=${clientId}`;

  function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }
  const NewclientId = getURLParameter("editting-clientId");

  if (clientId === NewclientId) {
    // Если текущий URL совпадает с целевой ссылкой, подсвечиваем кнопку
    button.classList.add("active");
    button.textContent = "Выбрано для редактирования";
  }
});

// Получаем ссылку на клиентов по классу
const clientLinks = document.querySelectorAll(".dish-filter");

function getQueryParamValue(url, param) {
  const urlObject = new URL(url);
  return urlObject.searchParams.get(param);
}
// Перебираем ссылки на клиентов и назначаем обработчик события на клик
clientLinks.forEach((link) => {
  link.addEventListener("click", function () {
    const url = window.location.href;

    const currentPosition = window.scrollY;
    sessionStorage.setItem("scrollPosition", currentPosition);
    // Получаем clientid из data-id атрибута кнопки клиента
    let clientId = null;
    const urlObject = new URL(url);
    clientId = urlObject.searchParams.get("editting-clientId");
    this.href += clientId;

    const urlParams = new URLSearchParams(window.location.search);
    const editting_clientId = urlParams.get("editting-clientId");

    const newURL = link.getAttribute("href");
    const dataId = this.dataset.id;
  });
});
