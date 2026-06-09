import requests

from app.models.weather import WeatherHourly


def load_weather(
            city_id,
            latitude,
            longitude,
            start_date,
            end_date,
            hourly_variables
    )->list[WeatherHourly]:
    url = "https://archive-api.open-meteo.com/v1/archive"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": ",".join(hourly_variables),
        "timezone": "auto",
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    data = response.json()
    hourly = data["hourly"]

    rows: list[WeatherHourly] = []

    for i in range(len(hourly["time"])):
        row = WeatherHourly(
            city_id=city_id,
            observed_at=hourly["time"][i],
            temperature_2m=hourly["temperature_2m"][i],
            precipitation=hourly["precipitation"][i],
            cloud_cover=hourly["cloud_cover"][i],
            relative_humidity_2m=hourly[
                "relative_humidity_2m"
            ][i],
            wind_speed_10m=hourly["wind_speed_10m"][i],
        )

        rows.append(row)

    return rows