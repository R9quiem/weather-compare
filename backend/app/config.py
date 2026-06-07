CITIES = {
    "Saint Petersburg": {
        "latitude": 59.9343,
        "longitude": 30.3351,
        "timezone": "Europe/Moscow",
    },
    "Tver": {
        "latitude": 56.8587,
        "longitude": 35.9176,
        "timezone": "Europe/Moscow",
    },
    "Vladivostok": {
        "latitude": 43.1155,
        "longitude": 131.8855,
    }
}

START_DATE = "2025-01-01"
END_DATE = "2025-12-31"

HOURLY_VARIABLES = [ # Возвращает время: дата + час также в json
    "temperature_2m", # Температура воздуха на высоте 2 метра (градусы цельсия).
    "precipitation", # Сумма осадков за час: дождь + снег (мм осадков).
    "cloud_cover", # Общая облачность в процентах.
    "sunshine_duration", # Сколько секунд в течение часа было солнечное сияние.
    "relative_humidity_2m", # Относительная влажность воздуха на высоте 2 метра (проценты).
    "wind_speed_10m", # Скорость ветра на высоте 10 метров (km/h).
]