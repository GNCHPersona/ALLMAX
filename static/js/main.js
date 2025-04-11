document.addEventListener('DOMContentLoaded', function() {

  // --- Preloader Logic ---
  const body = document.body;
  // Добавляем класс is-loading сразу при старте JS (хотя он уже есть в HTML)
  body.classList.add('is-loading');

  window.addEventListener('load', function() {
    // Убираем класс is-loading после полной загрузки страницы (включая картинки и стили)
    // Используем небольшую задержку для плавности
    setTimeout(() => {
       body.classList.remove('is-loading');
       // Можно добавить класс для анимации скрытия прелоадера, если нужно
       // document.getElementById('preloader').classList.add('preloader--hidden');
    }, 300); // Задержка в мс
  });

  // --- Intersection Observer for Animations ---
  const observerOptions = {
    threshold: 0.15 // Элемент считается видимым при пересечении 15%
  };

  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Опционально: Отключаем наблюдение после первого срабатывания анимации
        // observer.unobserve(entry.target);
      } else {
        // Опционально: Убираем класс, если элемент снова уходит из вида
         entry.target.classList.remove('in-view');
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  // Наблюдаем за всеми элементами с классом .animate-on-scroll
  document.querySelectorAll('.animate-on-scroll').forEach(elem => {
    observer.observe(elem);
  });

  // --- Smooth scrolling for anchor links (Optional) ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          const href = this.getAttribute('href');
          // Проверяем, что это не просто # и не ссылка на другой странице
          if (href !== '#' && href.length > 1 && !href.startsWith('#/') /*&& document.getElementById(href.substring(1))*/) {
              const targetId = href.substring(1);
              const targetElement = document.getElementById(targetId);
              if (targetElement) {
                  e.preventDefault();
                  // Вычисляем позицию с учетом высоты хедера (если он фиксированный)
                  const headerOffset = document.querySelector('header')?.offsetHeight || 0;
                  const elementPosition = targetElement.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20; // Доп. отступ

                  window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth"
                  });
              }
          }
      });
  });

}); // End DOMContentLoaded