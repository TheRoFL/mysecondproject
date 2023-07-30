// Получаем все элементы с классом "moving-element"
const elements = document.querySelectorAll(".moving-element");

// Функция для генерации случайного числа в заданном диапазоне
function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// Функция для изменения координат элементов
function moveElements() {
  elements.forEach((element) => {
    // Получаем размеры видимой области окна браузера
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Генерируем случайные значения для координат элемента в пределах страницы
    const newLeft = getRandom(0, windowWidth - element.offsetWidth);
    const newTop = getRandom(0, windowHeight - element.offsetHeight);

    // Применяем новые координаты
    element.style.left = `${newLeft}px`;
    element.style.top = `${newTop}px`;

    // Добавляем класс "shake" для анимации тряски
    element.classList.add("shake");

    // Удаляем класс "shake" после окончания анимации
    element.addEventListener("animationend", () => {
      element.classList.remove("shake");
    });
  });
}

// Вызываем функцию для изменения координат каждую секунду
setInterval(moveElements, 300);
