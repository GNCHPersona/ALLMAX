// static/js/relocation.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Получение элементов DOM ---
    const relocationTypeSelect = document.getElementById('relocation-type');
    const sourceCountrySelect = document.getElementById('source-country');
    const destinationCountrySelect = document.getElementById('destination-country');
    const alreadyHereButton = document.getElementById('already-here-button');

    const countrySelectHolder = document.getElementById('country-select-holder');
    // const sourceCountryWrapper = document.getElementById('source-country-wrapper'); // Не нужен для JS
    // const destinationCountryWrapper = document.getElementById('destination-country-wrapper'); // Не нужен для JS

    // Блок информации о релокации
    const relocationInfoBlock = document.getElementById('relocation-info');
    const relocationTypeDisplay = relocationInfoBlock?.querySelector('#relocation-type-display');
    const sourceCountryDisplay = relocationInfoBlock?.querySelector('#source-country-display');
    const destinationCountryDisplay = relocationInfoBlock?.querySelector('#destination-country-display');
    const relocationPrice = relocationInfoBlock?.querySelector('#relocation-price');
    const relocationDocumentsList = relocationInfoBlock?.querySelector('#relocation-documents');
    const scrollToDetailsButton = relocationInfoBlock?.querySelector('#scroll-to-details-button');

    // Секция Вакансий
    const vacanciesSection = document.getElementById('vacancies-section');
    const vacancyListContainer = vacanciesSection?.querySelector('#vacancy-list');
    const noVacanciesMessage = vacanciesSection?.querySelector('#no-vacancies-message');
    const destinationCountryVacanciesDisplay = vacanciesSection?.querySelector('#destination-country-vacancies-display');

    // Секция Образования
    const educationSection = document.getElementById('education-section');
    const educationListContainer = educationSection?.querySelector('#education-list');
    const noEducationMessage = educationSection?.querySelector('#no-education-message');
    const destinationCountryEducationDisplay = educationSection?.querySelector('#destination-country-education-display');

    // --- Загрузка данных ---
    let RELOCATION_CONFIG = {};
    const configScriptTag = document.getElementById('relocation-config');
    if (configScriptTag) {
        try {
            RELOCATION_CONFIG = JSON.parse(configScriptTag.textContent);
        } catch (e) {
            console.error("Error parsing relocation config JSON:", e);
            // Возможно, стоит показать пользователю сообщение об ошибке
            return;
        }
    } else {
        console.error("Relocation config script tag not found!");
        // Возможно, стоит показать пользователю сообщение об ошибке
        return;
    }

    // --- Вспомогательные функции ---
    function getCountryName(code) {
        return RELOCATION_CONFIG?.country_names?.[code] || code || 'Не указано';
    }
    function getRelocationTypeName(code) {
        return RELOCATION_CONFIG?.relocation_types?.[code] || code || 'Не указано';
    }

    // --- Функции обновления UI ---

    /**
     * Обновляет блок с информацией о стоимости и документах для релокации.
     */
    function updateRelocationInfo(typeCode, sourceCode, destCode) {
        if (!relocationInfoBlock) return;

        const isAlreadyHere = alreadyHereButton.classList.contains('active');

        // Скрываем блок, если выбрано "Я уже здесь" или не все параметры выбраны
        if (isAlreadyHere || !typeCode || !sourceCode || !destCode) {
            relocationInfoBlock.style.display = 'none';
            return;
        }

        const detailsKey = `${sourceCode}-${destCode}`;
        const typeDetails = RELOCATION_CONFIG?.relocation_details?.[typeCode];

        if (typeDetails && typeDetails[detailsKey]) {
            const data = typeDetails[detailsKey];
            const typeName = getRelocationTypeName(typeCode);
            const sourceName = getCountryName(sourceCode);
            const destName = getCountryName(destCode);

            if (relocationTypeDisplay) relocationTypeDisplay.textContent = typeName;
            if (sourceCountryDisplay) sourceCountryDisplay.textContent = sourceName;
            if (destinationCountryDisplay) destinationCountryDisplay.textContent = destName;
            if (relocationPrice) relocationPrice.textContent = data.price || 'не указана';

            if (relocationDocumentsList) {
                relocationDocumentsList.innerHTML = ''; // Очищаем список
                if (data.documents && Array.isArray(data.documents)) {
                    data.documents.forEach(doc => {
                        const li = document.createElement('li');
                        li.textContent = doc;
                        relocationDocumentsList.appendChild(li);
                    });
                } else {
                    relocationDocumentsList.innerHTML = '<li>Список документов не указан.</li>';
                }
            }
            relocationInfoBlock.style.display = 'block'; // Показываем блок
        } else {
            // Если данных для выбранной комбинации нет
            relocationInfoBlock.style.display = 'none';
        }
    }

    /**
     * Обновляет раздел с вакансиями для выбранной страны назначения.
     */
    function updateVacancies(destCode, typeCode) {
        if (!vacanciesSection || !RELOCATION_CONFIG?.vacancies) return;

        // Показываем раздел только если тип "Карьера" и выбрана страна назначения
        if (typeCode !== 'career' || !destCode) {
            vacanciesSection.style.display = 'none';
            return;
        }

        vacanciesSection.style.display = 'block';
        const destName = getCountryName(destCode);
        if (destinationCountryVacanciesDisplay) destinationCountryVacanciesDisplay.textContent = destName;

        vacancyListContainer.innerHTML = ''; // Очищаем список
        const vacanciesForDest = RELOCATION_CONFIG.vacancies[destCode];

        if (vacanciesForDest && Array.isArray(vacanciesForDest) && vacanciesForDest.length > 0) {
            noVacanciesMessage.style.display = 'none'; // Скрываем сообщение "Нет вакансий"
            vacanciesForDest.forEach(vacancy => {
                const vacancyItem = document.createElement('div');
                vacancyItem.classList.add('details-item', 'vacancy-item');
                // Используем HTML для создания карточки вакансии
                vacancyItem.innerHTML = `
                    <h4 class="details-item__title">${vacancy.title || 'Без названия'}</h4>
                    <p class="details-item__description">${vacancy.description || 'Описание отсутствует.'}</p>
                    ${vacancy.order_file_url ?
                        `<a href="${vacancy.order_file_url}" target="_blank" class="details-item__link vacancy-item__order-link">
                            <i class="fas fa-file-pdf"></i> Подробнее
                         </a>`
                        : '<p style="font-size: 14px; color: #888;">Файл приказа отсутствует</p>' // Сообщение если нет файла
                    }
                `;
                vacancyListContainer.appendChild(vacancyItem);
            });
        } else {
            noVacanciesMessage.style.display = 'block'; // Показываем сообщение "Нет вакансий"
        }
    }

    /**
     * Обновляет раздел с вариантами образования, ФИЛЬТРУЯ по стране происхождения.
     */
        /**
     * Обновляет раздел с вариантами образования, ФИЛЬТРУЯ по стране происхождения.
     */
    function updateEducation(sourceCode, destCode, typeCode) {
        if (!educationSection || !RELOCATION_CONFIG?.education_options) return;

        // Скрываем раздел, если тип не "образование" или не выбрана страна назначения
        if (typeCode !== 'education' || !destCode) {
            educationSection.style.display = 'none';
            return;
        }

        // Показываем раздел и обновляем заголовок
        educationSection.style.display = 'block';
        const destName = getCountryName(destCode);
        if (destinationCountryEducationDisplay) destinationCountryEducationDisplay.textContent = destName;
        educationListContainer.innerHTML = ''; // Очищаем предыдущий список

        const educationForDest = RELOCATION_CONFIG.education_options[destCode];

        // Проверяем, есть ли вообще ВУЗы для страны назначения
        if (!educationForDest || !Array.isArray(educationForDest) || educationForDest.length === 0) {
            noEducationMessage.style.display = 'block'; // Показываем сообщение "Нет вариантов"
            return;
        }

        // Фильтруем ВУЗы по стране происхождения
        const filteredEducation = educationForDest.filter(edu => {
             return sourceCode && Array.isArray(edu.accepted_countries) && edu.accepted_countries.includes(sourceCode);
        });

        // Отображаем отфильтрованный список или сообщение "Нет вариантов"
        if (filteredEducation.length > 0) {
            noEducationMessage.style.display = 'none'; // Скрываем сообщение
            filteredEducation.forEach(edu => {
                const eduItem = document.createElement('div');
                eduItem.classList.add('details-item', 'education-item');

                // --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
                // Теперь проверяем наличие order_file_url и генерируем ссылку на файл
                eduItem.innerHTML = `
                    <h4 class="details-item__title">${edu.name || 'Название ВУЗа не указано'}</h4>
                    <p class="details-item__description">${edu.description || 'Описание отсутствует.'}</p>
                    ${edu.order_file_url ? // Проверяем order_file_url вместо details_url
                        // Генерируем ссылку на файл, как в вакансиях
                        `<a href="${edu.order_file_url}" target="_blank" class="details-item__link education-item__order-link">
                            <i class="fas fa-file-alt"></i> Подробнее
                         </a>`
                        // Сообщение, если файла нет (аналогично вакансиям)
                        : '<p style="font-size: 14px; color: #888;">Файл с информацией отсутствует</p>'
                    }
                `;
                // --- КОНЕЦ ИЗМЕНЕНИЯ ---

                educationListContainer.appendChild(eduItem);
            });
        } else {
            // Если после фильтрации ничего не осталось (или не выбрана страна происхождения)
            noEducationMessage.style.display = 'block'; // Показываем сообщение "Нет вариантов"
        }
    } // Конец функции updateEducation

     /**
     * Обновляет видимость и ссылку кнопки "Прокрутить к деталям".
     * Учитывает фильтрацию ВУЗов по стране происхождения.
     */
     function updateScrollToButton(sourceCode, destCode, typeCode) {
        if (!scrollToDetailsButton || !destCode) {
            if (scrollToDetailsButton) scrollToDetailsButton.style.display = 'none';
            return;
        }

        let targetSectionId = null;
        let buttonText = '';
        let hasData = false; // Флаг наличия данных для отображения

        if (typeCode === 'career') {
            targetSectionId = 'vacancies-section';
            buttonText = 'Доступные вакансии';
            hasData = RELOCATION_CONFIG?.vacancies?.[destCode]?.length > 0;
        } else if (typeCode === 'education') {
            targetSectionId = 'education-section';
            buttonText = 'Доступные ВУЗы';
            // Проверяем, есть ли ВУЗы для страны назначения, которые примут студента из страны источника
            const educationForDest = RELOCATION_CONFIG?.education_options?.[destCode];
            if (sourceCode && educationForDest && Array.isArray(educationForDest)) {
                 // Используем .some() для проверки, есть ли хотя бы один подходящий ВУЗ
                 hasData = educationForDest.some(edu => Array.isArray(edu.accepted_countries) && edu.accepted_countries.includes(sourceCode));
            } else {
                 hasData = false; // Если нет страны источника или нет ВУЗов, данных нет
            }
        }

        // Показываем кнопку только если есть целевая секция и данные для нее
        if (targetSectionId && hasData) {
            scrollToDetailsButton.href = `#${targetSectionId}`;
            scrollToDetailsButton.textContent = buttonText; // Устанавливаем текст
            // Добавляем иконку (если используется Font Awesome)
            const icon = document.createElement('i');
            icon.className = 'fas fa-arrow-down';
            icon.style.marginLeft = '8px';
            scrollToDetailsButton.appendChild(icon); // Добавляем иконку к кнопке
            scrollToDetailsButton.style.display = 'inline-block'; // Показываем кнопку
        } else {
            scrollToDetailsButton.style.display = 'none'; // Скрываем кнопку
        }
    }

    /**
     * Управляет ТОЛЬКО классом .destination-only для запуска CSS анимаций видимости селекторов стран.
     */
    function handleCountrySelectorsVisibility(isDestinationOnly) {
        if (!countrySelectHolder) return;

        // Просто добавляем или убираем класс. CSS сам сделает анимацию.
        if (isDestinationOnly) {
            countrySelectHolder.classList.add('destination-only');
        } else {
            countrySelectHolder.classList.remove('destination-only');
        }
    }

    /**
     * Главная функция обновления страницы, вызываемая при изменении любого селектора.
     */
    function updatePageContent() {
        const typeCode = relocationTypeSelect.value;
        const sourceCode = sourceCountrySelect.value; // Получаем страну ИЗ
        const destCode = destinationCountrySelect.value; // Получаем страну КУДА
        const isAlreadyHere = alreadyHereButton.classList.contains('active');

        handleCountrySelectorsVisibility(isAlreadyHere); // Управляем видимостью селекторов стран через CSS

        // Показываем/скрываем блок с деталями релокации
        if (isAlreadyHere) {
             if (relocationInfoBlock) relocationInfoBlock.style.display = 'none';
        } else {
             updateRelocationInfo(typeCode, sourceCode, destCode);
        }

        // Обновляем секции вакансий и образования
        updateVacancies(destCode, typeCode);
        updateEducation(sourceCode, destCode, typeCode); // Передаем страну ИЗ

        // Обновляем кнопку прокрутки
        updateScrollToButton(sourceCode, destCode, typeCode); // Передаем страну ИЗ
    }

    // --- Обработчики событий ---
    relocationTypeSelect?.addEventListener('change', updatePageContent);
    sourceCountrySelect?.addEventListener('change', updatePageContent);
    destinationCountrySelect?.addEventListener('change', updatePageContent);

    alreadyHereButton?.addEventListener('click', () => {
        alreadyHereButton.classList.toggle('active');
        // Если кнопка стала активной, сбрасываем выбор страны ИЗ
        if (alreadyHereButton.classList.contains('active') && sourceCountrySelect) {
            sourceCountrySelect.value = ''; // Устанавливаем пустое значение
        }
        updatePageContent(); // Перерисовываем все и запускаем анимации через CSS
    });

    // --- Инициализация ---
    // Проверяем, что основные селекторы существуют
    if (relocationTypeSelect && sourceCountrySelect && destinationCountrySelect) {
         updatePageContent(); // Вызываем обновление при загрузке страницы
    } else {
        console.error("Ошибка: Не найдены основные элементы управления (селекторы).");
        // Возможно, стоит показать пользователю сообщение об ошибке
    }
});