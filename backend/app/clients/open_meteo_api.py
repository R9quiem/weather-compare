import time
import requests

from app.models.weather import WeatherHourly


def get_retry_delay(response: requests.Response, attempt: int) -> float:
    return 2 ** (attempt + 1)


def request_with_retry(
    url: str,
    params: dict,
    max_retries: int = 5,
) -> requests.Response:

    for attempt in range(max_retries):
        response = requests.get(url, params=params)

        if response.status_code != 429:
            response.raise_for_status()
            return response

        delay = get_retry_delay(response, attempt)
        time.sleep(delay)

    response.raise_for_status()
    return response


def load_weather(
    city_id, latitude, longitude, start_date, end_date, hourly_variables
) -> list[WeatherHourly]:
    url = "https://archive-api.open-meteo.com/v1/archive"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": ",".join(hourly_variables),
        "timezone": "auto",
        "models": "era5_land"
    }

    response = request_with_retry(url, params)

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
            relative_humidity_2m=hourly["relative_humidity_2m"][i],
            wind_speed_10m=hourly["wind_speed_10m"][i],
        )

        rows.append(row)

    return rows
