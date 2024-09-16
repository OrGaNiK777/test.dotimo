
// Получаем элементы из DOM
const playground = document.getElementById('playground');
const cube1 = document.getElementById('cube1');
const cube2 = document.getElementById('cube2');
const colorPicker = document.getElementById('colorPicker');

let selectedCube1 = null; // Переменная для хранения выбранного кубика
let selectedCube2 = null;
let attached = false; // Переменная для отслеживания статуса прилипания
let attachOffsetX1 = 0; // Отступ по оси X при прилипании для кубика 1
let attachOffsetY1 = 0; // Отступ по оси Y при прилипании для кубика 1
let attachOffsetX2 = 0; // Отступ по оси X при прилипании для кубика 2
let attachOffsetY2 = 0; // Отступ по оси Y при прилипании для кубика 2

/**
 * Функция для создания возможности перетаскивания кубиков.
 * @param {HTMLElement} cube - Кубик, который можно перетаскивать.
 */
function makeDraggable(cube) {
  // Начало перетаскивания
  cube.onmousedown = function (e) {
    let shiftX = e.clientX - cube.getBoundingClientRect().left;
    let shiftY = e.clientY - cube.getBoundingClientRect().top;

    // Функция для перемещения кубика
    function moveAt(pageX, pageY) {
      selectedCube1 = cube
      const rect = playground.getBoundingClientRect();
      let newX = pageX - rect.left - shiftX;
      let newY = pageY - rect.top - shiftY;

      // Ограничиваем перемещение кубиков в пределах площадки
      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      if (newX + cube.offsetWidth > playground.offsetWidth) {
        newX = playground.offsetWidth - cube.offsetWidth;
      }
      if (newY + cube.offsetHeight > playground.offsetHeight) {
        newY = playground.offsetHeight - cube.offsetHeight;
      }

      // Перемещение кубиков
      if (attached && ((cube === cube1) || (cube === cube2))) {
        cube1.style.left = newX + attachOffsetX1 + 'px';
        cube1.style.top = newY + attachOffsetY1 + 'px';
        cube2.style.left = newX + attachOffsetX2 + 'px';
        cube2.style.top = newY + attachOffsetY2 + 'px';

      } else {
        // Перемещаем только выбранный кубик
        cube.style.left = newX + 'px';
        cube.style.top = newY + 'px';
      }

      checkAttach(); // Проверяем на прилипание
    }

    // Обработчик движения мыши
    function onMouseMove(e) {
      moveAt(e.pageX, e.pageY);
    }

    // Добавляем обработчик события перемещения мыши
    document.addEventListener('mousemove', onMouseMove);

    // Завершаем перетаскивание
    document.onmouseup = function () {
      document.removeEventListener('mousemove', onMouseMove);

    };

    // Перезаписываем RGB цвет при выборке кубика
    cube.onclick = function (event) {
      event.stopPropagation(); // Остановить всплытие события, чтобы не убирался выделение при дублирующем клике
      console.log(selectedCube2)
      if (selectedCube2 === cube) {
        selectedCube2.style.border = null; // Убираем обводку
        selectedCube2 = null
      } else {
        if (selectedCube2) {
          selectedCube2.style.border = null;
          selectedCube2 = null
        }
        selectedCube2 = cube;
        cube.style.border = `5px solid black`; // Обводка для выделения
        colorPicker.value = rgbToHex(cube.style.backgroundColor); // Устанавливаем выбранный цвет
      }
    };
  };

}

function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
  return `#${result}`;
}

// Обработка изменения цвета выбранного кубика
colorPicker.addEventListener('input', function () {
  if (selectedCube2) {
    selectedCube2.style.backgroundColor = colorPicker.value; // Меняем цвет выбранного кубика
  }
});

/**
 * Функция для проверки на прилипание кубиков.
 */
function checkAttach() {
  if (attached) return; // Если кубики уже прилипли, ничего не делаем

  const rect1 = cube1.getBoundingClientRect();
  const rect2 = cube2.getBoundingClientRect();
  const distance = Math.hypot(rect1.left - rect2.left, rect1.top - rect2.top); // Вычисляем расстояние

  // Если расстояние между кубиками меньше 20 пикселей, они прилипают
  if (distance < 100) {
    attached = true;
    mergeCubes(rect1, rect2); // Объединяем кубики
  }
}

function mergeCubes(rect1, rect2) {
  const playgroundRect = playground.getBoundingClientRect();

  // Вычисляем расстояния между краями кубиков
  const distanceRight = rect1.right - rect2.left;
  const distanceLeft = rect1.left - rect2.right;
  const distanceTop = rect1.top - rect2.bottom;
  const distanceBottom = rect1.bottom - rect2.top;

  // Определяем, к какому краю прилипнуть и сохраняем смещения
  if (Math.abs(distanceRight) < Math.abs(distanceLeft) &&
    Math.abs(distanceRight) < Math.abs(distanceTop) &&
    Math.abs(distanceRight) < Math.abs(distanceBottom)) {
    // Прилипание к правому краю первого
    if (selectedCube1 !== cube1) {
      attachOffsetX1 = -rect1.width; // Сохраняем отступ для первого кубика
      attachOffsetY1 = rect1.top - rect2.top
      // Прилипание к левому краю второго
    } else {
      attachOffsetX2 = rect1.width; // Отступ для второго кубика
      attachOffsetY2 = -(rect1.top - rect2.top)
    }

  } else if (Math.abs(distanceLeft) < Math.abs(distanceRight) &&
    Math.abs(distanceLeft) < Math.abs(distanceTop) &&
    Math.abs(distanceLeft) < Math.abs(distanceBottom)) {
    // Прилипание к левому краю
    if (selectedCube1 !== cube1) {
      attachOffsetX1 = rect2.width; // Сохраняем отступ для первого кубика
      attachOffsetY1 = rect1.top - rect2.top
      // Прилипание к правому краю второго
    } else {
      attachOffsetX2 = -rect2.width; // Отступ для второго кубика
      attachOffsetY2 = -(rect1.top - rect2.top)
    }

  } else if (Math.abs(distanceBottom) < Math.abs(distanceTop) &&
    Math.abs(distanceBottom) < Math.abs(distanceRight) &&
    Math.abs(distanceBottom) < Math.abs(distanceLeft)) {
    // Прилипание к нижнему краю
    if (selectedCube1 !== cube1) {
      attachOffsetX1 = rect1.left - rect2.left
      attachOffsetY1 = -rect1.height; // Сохраняем отступ для первого кубика
    } else {
      attachOffsetX2 = -(rect1.left - rect2.left)
      attachOffsetY2 = rect1.height; // Сохраняем отступ для второго кубика
    }

  } else {
    // Прилипание к верхнему краю первого
    if (selectedCube1 !== cube1) {
      attachOffsetX1 = rect1.left - rect2.left
      attachOffsetY1 = rect2.height; // Сохраняем отступ для первого кубика
      // Прилипание к нижнему краю вторго
    } else {
      attachOffsetX2 = -(rect1.left - rect2.left)
      attachOffsetY2 = -rect2.height; // Сохраняем отступ для второго кубика 
    }
  }

}

/**
 * Функция для разъединения кубиков.
 */
function detachCubes() {
  if (selectedCube1) { selectedCube1 = null; }
  if (selectedCube2) {
    selectedCube2 = null; cube1.style.border = null;
    cube2.style.border = null;
  }

  // Переменная для хранения выбранного кубика
  attached = false; // Переменная для отслеживания статуса прилипания
  attachOffsetX1 = 0; // Отступ по оси X при прилипании для кубика 1
  attachOffsetY1 = 0; // Отступ по оси Y при прилипании для кубика 1
  attachOffsetX2 = 0; // Отступ по оси X при прилипании для кубика 2
  attachOffsetY2 = 0; // Отступ по оси Y при прилипании для кубика 2
  colorPicker.value = null;
  cube1.style.pointerEvents = 'auto'; // Включаем взаимодействие с первым кубиком
  cube2.style.pointerEvents = 'auto'; // Включаем взаимодействие со вторым кубиком

  // Перемещаем кубики в случайные позиции
  cube1.style.left = Math.random() * (playground.offsetWidth - cube1.offsetWidth) + 'px';
  cube1.style.top = Math.random() * (playground.offsetHeight - cube1.offsetHeight) + 'px';
  cube2.style.left = Math.random() * (playground.offsetWidth - cube2.offsetWidth) + 'px';
  cube2.style.top = Math.random() * (playground.offsetHeight - cube2.offsetHeight) + 'px';


}


// Добавляем обработчик для кнопки "Разъединить"
document.getElementById('detachButton').onclick = detachCubes;

// Вызываем detachCubes при загрузке
window.onload = detachCubes;

// Делаем кубики перетаскиваемыми
makeDraggable(cube1);
makeDraggable(cube2);