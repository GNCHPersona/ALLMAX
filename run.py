# run.py
from backend.main import app

if __name__ == "__main__":
    # debug=True включает автоперезагрузку при изменениях кода и подробные ошибки
    # host='0.0.0.0' делает сервер доступным с других устройств в сети (опционально)
    app.run(debug=True, host='0.0.0.0')