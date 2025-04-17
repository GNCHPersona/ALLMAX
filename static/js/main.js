document.addEventListener('DOMContentLoaded', function() {

  // --- Preloader Logic ---
  const body = document.body;
  // Класс is-loading уже должен быть в HTML, но на всякий случай убедимся
  body.classList.add('is-loading');

  window.addEventListener('load', function() {
    // Убираем класс is-loading после полной загрузки страницы
    setTimeout(() => {
       body.classList.remove('is-loading');
       // Убедимся, что прелоадер действительно исчезнет (если transition не сработал)
       const preloader = document.getElementById('preloader');
       if(preloader) {
         preloader.style.display = 'none'; // Можно скрыть окончательно после анимации
       }
    }, 500); // Немного увеличим задержку, чтобы соответствовать CSS transition (0.5s)
  });

  // --- Intersection Observer for Animations ---
  const observerOptions = {
    threshold: 0.15 // Элемент считается видимым при пересечении 15%
    // rootMargin: '0px 0px -50px 0px' // Можно добавить, чтобы анимация срабатывала чуть раньше/позже
  };

  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Опционально: Отключаем наблюдение после первого срабатывания анимации
        // observer.unobserve(entry.target);
      } else {
        // Опционально: Убираем класс, если элемент снова уходит из вида (для повторяющейся анимации)
        entry.target.classList.remove('in-view');
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  // Наблюдаем за всеми элементами с классом .animate-on-scroll
  const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
  if (elementsToAnimate.length > 0) {
      elementsToAnimate.forEach(elem => {
        observer.observe(elem);
      });
  } else {
      console.warn("No elements with class .animate-on-scroll found for Intersection Observer.");
  }


  // --- Мобильное меню ---
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.getElementById('main-nav');
  const mainHeader = document.getElementById('main-header');

  // Проверяем наличие всех элементов перед добавлением слушателей
  if (navToggle && mainNav && mainHeader) {
      navToggle.addEventListener('click', () => {
          // Переключаем классы на body (для overflow) и header (для стилей кнопки/меню)
          body.classList.toggle('nav-open');
          mainHeader.classList.toggle('nav-open');

          // Управление ARIA атрибутами для доступности (опционально, но хорошо)
          const isExpanded = mainHeader.classList.contains('nav-open');
          navToggle.setAttribute('aria-expanded', isExpanded);
          mainNav.setAttribute('aria-hidden', !isExpanded);
      });

      // Закрытие меню при клике на ссылку внутри него (для якорей или SPA)
      const navLinks = mainNav.querySelectorAll('a');
      navLinks.forEach(link => {
          link.addEventListener('click', () => {
              // Проверяем, открыто ли меню перед закрытием
              if (body.classList.contains('nav-open')) {
                  body.classList.remove('nav-open');
                  mainHeader.classList.remove('nav-open');
                  navToggle.setAttribute('aria-expanded', 'false');
                  mainNav.setAttribute('aria-hidden', 'true');
              }
          });
      });

      // Закрытие меню при клике на оверлей (фон)
      mainNav.addEventListener('click', (event) => {
          // Закрываем только если клик был непосредственно по nav#main-nav (оверлею)
          if (event.target === mainNav && body.classList.contains('nav-open')) {
              body.classList.remove('nav-open');
              mainHeader.classList.remove('nav-open');
              navToggle.setAttribute('aria-expanded', 'false');
              mainNav.setAttribute('aria-hidden', 'true');
          }
      });

      // Закрытие меню по клавише Escape (Доступность)
      window.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && body.classList.contains('nav-open')) {
              body.classList.remove('nav-open');
              mainHeader.classList.remove('nav-open');
              navToggle.setAttribute('aria-expanded', 'false');
              mainNav.setAttribute('aria-hidden', 'true');
          }
      });

  } else {
      console.warn("Mobile menu elements (.nav-toggle, #main-nav, #main-header) not found. Menu functionality disabled.");
  }


  // --- Smooth scrolling for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          const href = this.getAttribute('href');

          // Убедимся что это ссылка на якорь на ТЕКУЩЕЙ странице
          if (href && href.length > 1 && href.startsWith('#')) {
              try {
                  const targetId = href.substring(1);
                  const targetElement = document.getElementById(targetId);

                  if (targetElement) {
                      e.preventDefault(); // Предотвращаем стандартный переход только если элемент найден

                      // Вычисляем позицию с учетом высоты хедера (если он фиксированный)
                      const header = document.querySelector('#main-header'); // Используем ID хедера
                      const headerOffset = header ? header.offsetHeight : 0;
                      const elementPosition = targetElement.getBoundingClientRect().top;
                      // window.pageYOffset устарел, используем window.scrollY
                      const offsetPosition = elementPosition + window.scrollY - headerOffset - 20; // Доп. отступ 20px

                      window.scrollTo({
                          top: offsetPosition,
                          behavior: "smooth"
                      });
                  }
                  // Если элемент не найден, позволяем стандартному поведению (или логируем ошибку)
                  // else { console.warn(`Smooth scroll target element with ID "${targetId}" not found.`); }

              } catch (error) {
                  console.error("Error during smooth scroll:", error);
                  // В случае ошибки, позволяем стандартному поведению браузера
              }
          }
          // Если это не якорь (напр., #) или ссылка на другую страницу, ничего не делаем,
          // браузер обработает ее как обычно.
      });
  });

}); // End DOMContentLoaded