// static/js/relocation.js
// Код остается таким же, как в предыдущем ответе
// Он только добавляет/удаляет класс .destination-only

document.addEventListener('DOMContentLoaded', () => {
    // --- Получение элементов DOM ---
    const relocationTypeSelect = document.getElementById('relocation-type');
    const sourceCountrySelect = document.getElementById('source-country');
    const destinationCountrySelect = document.getElementById('destination-country');
    const alreadyHereButton = document.getElementById('already-here-button');

    const countrySelectHolder = document.getElementById('country-select-holder');
    // const sourceCountryWrapper = document.getElementById('source-country-wrapper'); // Не нужен для JS
    // const destinationCountryWrapper = document.getElementById('destination-country-wrapper'); // Не нужен для JS

    // Блок информации о релокации и т.д. ...
    const relocationInfoBlock = document.getElementById('relocation-info');
    const relocationTypeDisplay = relocationInfoBlock?.querySelector('#relocation-type-display');
    const sourceCountryDisplay = relocationInfoBlock?.querySelector('#source-country-display');
    const destinationCountryDisplay = relocationInfoBlock?.querySelector('#destination-country-display');
    const relocationPrice = relocationInfoBlock?.querySelector('#relocation-price');
    const relocationDocumentsList = relocationInfoBlock?.querySelector('#relocation-documents');
    const scrollToDetailsButton = relocationInfoBlock?.querySelector('#scroll-to-details-button');
    const vacanciesSection = document.getElementById('vacancies-section');
    const vacancyListContainer = vacanciesSection?.querySelector('#vacancy-list');
    const noVacanciesMessage = vacanciesSection?.querySelector('#no-vacancies-message');
    const destinationCountryVacanciesDisplay = vacanciesSection?.querySelector('#destination-country-vacancies-display');
    const educationSection = document.getElementById('education-section');
    const educationListContainer = educationSection?.querySelector('#education-list');
    const noEducationMessage = educationSection?.querySelector('#no-education-message');
    const destinationCountryEducationDisplay = educationSection?.querySelector('#destination-country-education-display');

    // --- Загрузка данных ---
    let RELOCATION_CONFIG = {};
    const configScriptTag = document.getElementById('relocation-config');
    if (configScriptTag) {
        try { RELOCATION_CONFIG = JSON.parse(configScriptTag.textContent); }
        catch (e) { console.error("Error parsing relocation config JSON:", e); return; }
    } else { console.error("Relocation config script tag not found!"); return; }

    // --- Вспомогательные функции ---
    function getCountryName(code) { return RELOCATION_CONFIG?.country_names?.[code] || code || 'Не указано'; }
    function getRelocationTypeName(code) { return RELOCATION_CONFIG?.relocation_types?.[code] || code || 'Не указано'; }

    // --- Функции обновления UI --- (updateRelocationInfo, updateVacancies, updateEducation, updateScrollToButton - БЕЗ ИЗМЕНЕНИЙ)
     function updateRelocationInfo(typeCode, sourceCode, destCode) { /* ... как было ... */
        if (!relocationInfoBlock) return;
        const isAlreadyHere = alreadyHereButton.classList.contains('active');
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
                relocationDocumentsList.innerHTML = '';
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
            relocationInfoBlock.style.display = 'block';
        } else {
            relocationInfoBlock.style.display = 'none';
        }
     }
     function updateVacancies(destCode, typeCode) { /* ... как было ... */
        if (!vacanciesSection || !RELOCATION_CONFIG?.vacancies) return;
        if (typeCode !== 'career' || !destCode) {
            vacanciesSection.style.display = 'none';
            return;
        }
        vacanciesSection.style.display = 'block';
        const destName = getCountryName(destCode);
        if (destinationCountryVacanciesDisplay) destinationCountryVacanciesDisplay.textContent = destName;
        vacancyListContainer.innerHTML = '';
        const vacanciesForDest = RELOCATION_CONFIG.vacancies[destCode];
        if (vacanciesForDest && Array.isArray(vacanciesForDest) && vacanciesForDest.length > 0) {
            noVacanciesMessage.style.display = 'none';
            vacanciesForDest.forEach(vacancy => {
                const vacancyItem = document.createElement('div');
                vacancyItem.classList.add('details-item', 'vacancy-item');
                vacancyItem.innerHTML = `
                    <h4 class="details-item__title">${vacancy.title || 'Без названия'}</h4>
                    <p class="details-item__description">${vacancy.description || 'Описание отсутствует.'}</p>
                    ${vacancy.order_file_url ?
                        `<a href="${vacancy.order_file_url}" target="_blank" class="details-item__link vacancy-item__order-link">
                            <i class="fas fa-file-pdf"></i> Смотреть приказ
                         </a>`
                        : '<p style="font-size: 14px; color: #888;">Файл приказа отсутствует</p>'
                    }
                `;
                vacancyListContainer.appendChild(vacancyItem);
            });
        } else {
            noVacanciesMessage.style.display = 'block';
        }
     }
     function updateEducation(destCode, typeCode) { /* ... как было ... */
         if (!educationSection || !RELOCATION_CONFIG?.education_options) return;
        if (typeCode !== 'education' || !destCode) {
            educationSection.style.display = 'none';
            return;
        }
        educationSection.style.display = 'block';
        const destName = getCountryName(destCode);
        if (destinationCountryEducationDisplay) destinationCountryEducationDisplay.textContent = destName;
        educationListContainer.innerHTML = '';
        const educationForDest = RELOCATION_CONFIG.education_options[destCode];
        if (educationForDest && Array.isArray(educationForDest) && educationForDest.length > 0) {
            noEducationMessage.style.display = 'none';
            educationForDest.forEach(edu => {
                const eduItem = document.createElement('div');
                eduItem.classList.add('details-item', 'education-item');
                eduItem.innerHTML = `
                    <h4 class="details-item__title">${edu.name || 'Название ВУЗа не указано'}</h4>
                    <p class="details-item__description">${edu.description || 'Описание отсутствует.'}</p>
                    ${edu.details_url ?
                        `<a href="${edu.details_url}" target="_blank" class="details-item__link education-item__details-link">
                            <i class="fas fa-external-link-alt"></i> Подробнее на сайте ВУЗа
                         </a>`
                        : ''
                    }
                `;
                educationListContainer.appendChild(eduItem);
            });
        } else {
            noEducationMessage.style.display = 'block';
        }
     }
     function updateScrollToButton(destCode, typeCode) { /* ... как было ... */
        if (!scrollToDetailsButton || !destCode) {
            if (scrollToDetailsButton) scrollToDetailsButton.style.display = 'none';
            return;
        }
        let targetSectionId = null;
        let buttonText = '';
        let hasData = false;
        if (typeCode === 'career') {
            targetSectionId = 'vacancies-section';
            buttonText = 'Доступные вакансии';
            hasData = RELOCATION_CONFIG?.vacancies?.[destCode]?.length > 0;
        } else if (typeCode === 'education') {
            targetSectionId = 'education-section';
            buttonText = 'Доступные ВУЗы';
            hasData = RELOCATION_CONFIG?.education_options?.[destCode]?.length > 0;
        }
        if (targetSectionId && hasData) {
            scrollToDetailsButton.href = `#${targetSectionId}`;
            scrollToDetailsButton.textContent = buttonText;
            const icon = document.createElement('i');
            icon.className = 'fas fa-arrow-down';
            icon.style.marginLeft = '8px';
            scrollToDetailsButton.appendChild(icon);
            scrollToDetailsButton.style.display = 'inline-block';
        } else {
            scrollToDetailsButton.style.display = 'none';
        }
     }

    /**
     * Управляет ТОЛЬКО классом .destination-only для запуска CSS анимаций
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
     * Главная функция обновления страницы
     */
    function updatePageContent() {
        const typeCode = relocationTypeSelect.value;
        const sourceCode = sourceCountrySelect.value;
        const destCode = destinationCountrySelect.value;
        const isAlreadyHere = alreadyHereButton.classList.contains('active');

        handleCountrySelectorsVisibility(isAlreadyHere); // Управляем классом для CSS анимаций

        if (isAlreadyHere) {
             if (relocationInfoBlock) relocationInfoBlock.style.display = 'none';
        } else {
             updateRelocationInfo(typeCode, sourceCode, destCode);
        }

        updateVacancies(destCode, typeCode);
        updateEducation(destCode, typeCode);
        updateScrollToButton(destCode, typeCode);
    }

    // --- Обработчики событий ---
    relocationTypeSelect?.addEventListener('change', updatePageContent);
    sourceCountrySelect?.addEventListener('change', updatePageContent);
    destinationCountrySelect?.addEventListener('change', updatePageContent);

    alreadyHereButton?.addEventListener('click', () => {
        alreadyHereButton.classList.toggle('active');
        if (alreadyHereButton.classList.contains('active') && sourceCountrySelect) {
            sourceCountrySelect.value = '';
        }
        updatePageContent(); // Перерисовываем все и запускаем анимации через CSS
    });

    // --- Инициализация ---
    if (relocationTypeSelect && destinationCountrySelect) {
         updatePageContent();
    } else {
        console.error("Ошибка: Не найдены основные элементы управления (селекторы).");
    }
});