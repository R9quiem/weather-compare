from app.models import CreateCity

CITIES = [
    CreateCity(
        name="Санкт-Петербург",
        country_code="RU",
        latitude=59.9386,
        longitude=30.3141,
    ),
    CreateCity(
        name="Москва",
        country_code="RU",
        latitude=55.7558,
        longitude=37.6173,
    ),
    CreateCity(
        name="Владивосток",
        country_code="RU",
        latitude=43.1155,
        longitude=131.8855,
    ),

    CreateCity(
        name="Тверь",
        country_code="RU",
        latitude=56.8584,
        longitude=35.9006,
    ),

    CreateCity(
        name="Ростов-на-Дону",
        country_code="RU",
        latitude=47.2221,
        longitude=39.7203,
    ),

    CreateCity(
        name="Марсель",
        country_code="FR",
        latitude=43.2965,
        longitude=5.3698,
    ),
]

START_DATE = "1995-01-01"
END_DATE = "2025-12-31"

HOURLY_VARIABLES = [ # Возвращает время: дата + час также в json
    "temperature_2m", # Температура воздуха на высоте 2 метра (градусы цельсия).
    "precipitation", # Сумма осадков за час: дождь + снег (мм осадков).
    "cloud_cover", # Общая облачность в процентах.
    "sunshine_duration", # Сколько секунд в течение часа было солнечное сияние.
    "relative_humidity_2m", # Относительная влажность воздуха на высоте 2 метра (проценты).
    "wind_speed_10m", # Скорость ветра на высоте 10 метров (km/h).
]