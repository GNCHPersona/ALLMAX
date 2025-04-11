# backend/main.py
import json
import os
import time # Добавили импорт time
from flask import Flask, render_template, url_for, g

# Определяем путь к файлу данных относительно текущего файла main.py
DATA_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'relocation_config.json')

# --- Инициализация Flask ---
# Важно инициализировать app до использования app.logger
app = Flask(__name__, template_folder='../templates', static_folder='../static')

# --- Функция для загрузки данных ---
def load_relocation_data():
    """Загружает данные из JSON файла."""
    try:
        with open(DATA_FILE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Используем логгер Flask вместо print
            app.logger.info(f"Relocation data loaded successfully from {DATA_FILE_PATH}.")
            return data
    except FileNotFoundError:
        app.logger.error(f"Data file not found at {DATA_FILE_PATH}")
        return None
    except json.JSONDecodeError:
        app.logger.error(f"Could not decode JSON from {DATA_FILE_PATH}")
        return None
    except Exception as e:
        app.logger.error(f"An unexpected error occurred while loading data: {e}")
        return None

# --- Кэширование данных ---
# Глобальные переменные для кэша и времени
CACHED_RELOCATION_CONFIG = None
LAST_LOAD_TIME = 0
DATA_FILE_MTIME = 0

def get_relocation_data_cached():
    """Возвращает данные конфигурации, перезагружая их при необходимости."""
    global CACHED_RELOCATION_CONFIG, LAST_LOAD_TIME, DATA_FILE_MTIME
    try:
        # Проверяем время модификации файла
        current_mtime = os.path.getmtime(DATA_FILE_PATH)

        # Перезагружаем, если файл изменился ИЛИ если конфиг еще не загружен
        if current_mtime > DATA_FILE_MTIME or CACHED_RELOCATION_CONFIG is None:
            app.logger.info(f"Reloading data from {DATA_FILE_PATH} as it has changed or cache is empty.")
            new_data = load_relocation_data() # Загружаем свежие данные

            if new_data is not None:
                CACHED_RELOCATION_CONFIG = new_data
                DATA_FILE_MTIME = current_mtime
                LAST_LOAD_TIME = time.time()
                app.logger.info("Cache updated successfully.")
            else:
                # Если загрузка не удалась, не обновляем кэш, но логируем ошибку
                app.logger.error("Failed to reload data, cache not updated.")
                # Важно: Если первая загрузка не удалась, CACHED_RELOCATION_CONFIG останется None
                # Если последующая перезагрузка не удалась, вернем старое значение из кэша (если оно есть)
                # или None, если кэш пуст.
        # else: # Для отладки можно раскомментировать
        #    app.logger.debug("Using cached relocation data.")

        return CACHED_RELOCATION_CONFIG # Возвращаем текущее значение из кэша

    except FileNotFoundError:
         app.logger.error(f"Data file not found at {DATA_FILE_PATH} during cache check.")
         CACHED_RELOCATION_CONFIG = None # Сбрасываем кэш, если файл исчез
         DATA_FILE_MTIME = 0
         return None
    except Exception as e:
        app.logger.error(f"An error occurred during cache check/reload: {e}")
        # В случае других ошибок, безопаснее вернуть то, что есть в кэше (даже если None)
        return CACHED_RELOCATION_CONFIG

# --- УДАЛЯЕМ СТАРУЮ ГЛОБАЛЬНУЮ ЗАГРУЗКУ ---
# RELOCATION_CONFIG = load_relocation_data() # <-- ЭТА СТРОКА УДАЛЕНА/ЗАКОММЕНТИРОВАНА

# --- Контекстный процессор для передачи данных во все шаблоны (удобно) ---
@app.context_processor
def inject_global_data():
    # Передаем функцию url_for и, например, текущий год (если нужно)
    import datetime
    current_year = datetime.datetime.now().year

    # Получаем данные через кэширующую функцию
    relocation_config = get_relocation_data_cached()

    global_data = {
        'url_for': url_for,
        'current_year': current_year,
        'country_names': {},
        'relocation_types': {}
    }
    # Проверяем, загрузились ли данные
    if relocation_config:
        global_data['country_names'] = relocation_config.get('country_names', {})
        global_data['relocation_types'] = relocation_config.get('relocation_types', {})
    else:
         # Можно добавить логирование, если данные НИКОГДА не загружались
         app.logger.warning("Relocation config is not available for context processor.")

    return global_data

# --- Маршруты ---
@app.route('/')
def index_page():
    return render_template('index.html')

@app.route('/relocation')
def relocation_page():
    # Получаем актуальные данные (кэш или свежие)
    relocation_config = get_relocation_data_cached()

    if not relocation_config:
        # Обработка ошибки, если данные не загрузились даже при старте или исчез файл
        app.logger.error("Cannot render relocation page because config data is unavailable.")
        return "Ошибка: Не удалось загрузить конфигурацию релокации. Пожалуйста, попробуйте позже.", 500

    # Извлекаем нужные части из актуальных данных
    relocation_details = relocation_config.get('relocation_details', {})
    country_names = relocation_config.get('country_names', {})
    relocation_types = relocation_config.get('relocation_types', {})

    # Определяем доступные страны на основе актуальных данных
    all_source_codes = set()
    all_destination_codes = set()
    # Добавим проверку, что relocation_details не пустой словарь
    if relocation_details:
        for type_data in relocation_details.values():
             # Добавим проверку, что type_data это словарь
            if isinstance(type_data, dict):
                for pair in type_data.keys():
                    # Добавим проверку, что ключ содержит дефис
                    if '-' in pair:
                        source, dest = pair.split('-', 1) # split на 2 части
                        if source: all_source_codes.add(source)
                        if dest: all_destination_codes.add(dest)
                    else:
                        app.logger.warning(f"Invalid key format found in relocation_details: {pair}")
            else:
                 app.logger.warning(f"Expected dict for relocation type data, got: {type(type_data)}")

    # Формируем словари для опций select из актуальных данных
    source_countries_options = {code: country_names.get(code, code) for code in sorted(list(all_source_codes))}
    destination_countries_options = {code: country_names.get(code, code) for code in sorted(list(all_destination_codes))}

    context = {
        # Передаем АКТУАЛЬНУЮ конфигурацию в JS через JSON строку
        'relocation_config_json': json.dumps(relocation_config),
        # Передаем подготовленные списки для генерации select'ов в шаблоне
        'source_countries_options': source_countries_options,
        'destination_countries_options': destination_countries_options,
        # Названия стран и типов уже доступны глобально через обновленный context_processor
    }
    return render_template('relocation.html', **context)

# --- Остальные маршруты без изменений ---
@app.route('/outsourcing')
def outsourcing_page():
    return render_template('outsourcing.html')

@app.route('/translation')
def translation_page():
    return render_template('translation.html')

@app.route('/others')
def others_page():
    return render_template('others.html')

# --- Блок запуска для разработки ---
# if __name__ == "__main__":
#     # Этот блок теперь в run.py, здесь он не нужен,
#     # но если бы запускали main.py напрямую, то он бы остался.
#     # app.run(debug=True, host='0.0.0.0')
#     pass # Оставляем пустым или удаляем, если запуск только через run.py