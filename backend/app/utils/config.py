from app.models import CreateCity

CITIES = [
    CreateCity(
        slug="vladivostok",
        name="Владивосток",
        country_code="RU",
        latitude=43.1155,
        longitude=131.8855,
    ),
    CreateCity(
        slug="tver",
        name="Тверь",
        country_code="RU",
        latitude=56.8584,
        longitude=35.9006,
    ),
    CreateCity(
        slug="saint_petersburg",
        name="Санкт-Петербург",
        country_code="RU",
        latitude=59.9386,
        longitude=30.3141,
    ),
    CreateCity(
        slug="moscow",
        name="Москва",
        country_code="RU",
        latitude=55.7558,
        longitude=37.6173,
    ),
    CreateCity(
        slug="rostov_on_don",
        name="Ростов-на-Дону",
        country_code="RU",
        latitude=47.2221,
        longitude=39.7203,
    ),
    CreateCity(
        slug="yekaterinburg",
        name="Екатеринбург",
        country_code="RU",
        latitude=56.8389,
        longitude=60.6057,
    ),
    CreateCity(
        slug="tokyo",
        name="Токио",
        country_code="JP",
        latitude=35.6762,
        longitude=139.6503,
    ),
    CreateCity(
        slug="new_york",
        name="Нью-Йорк",
        country_code="US",
        latitude=40.7128,
        longitude=-74.0060,
    ),
    CreateCity(
        slug="london",
        name="Лондон",
        country_code="GB",
        latitude=51.5074,
        longitude=-0.1278,
    ),
    CreateCity(
        slug="madrid",
        name="Мадрид",
        country_code="ES",
        latitude=40.4168,
        longitude=-3.7038,
    ),
    CreateCity(
        slug="marseille",
        name="Марсель",
        country_code="FR",
        latitude=43.2965,
        longitude=5.3698,
    ),
    CreateCity(
        slug="paris",
        name="Париж",
        country_code="FR",
        latitude=48.8566,
        longitude=2.3522,
    ),
]

START_DATE = "1995-01-01"
END_DATE = "2025-12-31"

HOURLY_VARIABLES = [  # Возвращает время: дата + час также в json
    "temperature_2m",  # Температура воздуха на высоте 2 метра (градусы цельсия).
    "precipitation",  # Сумма осадков за час: дождь + снег (мм осадков).
    "cloud_cover",  # Общая облачность в процентах.
    "sunshine_duration",  # Сколько секунд в течение часа было солнечное сияние.
    "relative_humidity_2m",  # Относительная влажность воздуха на высоте 2 метра (проценты).
    "wind_speed_10m",  # Скорость ветра на высоте 10 метров (km/h).
    "wind_direction_10m",  # Направление, откуда дует ветер, на высоте 10 метров (градусы).
    "wind_gusts_10m",  # Расчётная скорость порывов ветра на высоте 10 метров (km/h).
]
