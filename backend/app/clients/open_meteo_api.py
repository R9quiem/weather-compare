import requests


def load_weather(city_name, latitude, longitude, start_date, end_date, hourly_variables):
    url = "https://archive-api.open-meteo.com/v1/archive"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": ",".join(hourly_variables),
        "timezone": "Europe/Moscow",
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    data = response.json()
    hourly = data["hourly"]

    rows = []

    for i in range(len(hourly["time"])):
        row = {
            "city": city_name,
            "time": hourly["time"][i],
            "temperature_2m": hourly["temperature_2m"][i],
            "precipitation": hourly["precipitation"][i],
            "cloud_cover": hourly["cloud_cover"][i],
            "relative_humidity_2m": hourly["relative_humidity_2m"][i],
            "wind_speed_10m": hourly["wind_speed_10m"][i],
        }

        rows.append(row)

    return rows