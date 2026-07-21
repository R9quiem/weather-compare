import logging
import time
from datetime import UTC, datetime, timedelta

import requests

from app.models.weather import WeatherHourly

logger = logging.getLogger(__name__)


def get_retry_delay(response: requests.Response, attempt: int) -> float:
    retry_after = response.headers.get("Retry-After")

    if retry_after is not None:
        try:
            return max(float(retry_after), 1.0)
        except ValueError:
            pass

    try:
        reason = response.json().get("reason", "").lower()
    except requests.JSONDecodeError:
        reason = ""

    if "daily api request limit" in reason:
        now = datetime.now(UTC)
        next_utc_day = datetime.combine(
            now.date() + timedelta(days=1),
            datetime.min.time(),
            tzinfo=UTC,
        )
        return max((next_utc_day - now).total_seconds() + 5 * 60, 60.0)

    if "hourly api request limit" in reason:
        return 60 * 60

    return min(60 * (2**attempt), 15 * 60)


def request_with_retry(
    url: str,
    params: dict,
    max_retries: int = 8,
) -> requests.Response:

    for attempt in range(max_retries):
        response = requests.get(url, params=params, timeout=180)

        if response.status_code != 429:
            response.raise_for_status()
            return response

        if attempt == max_retries - 1:
            break

        delay = get_retry_delay(response, attempt)
        logger.warning(
            "Open-Meteo rate limit reached; retrying in %.0f seconds (%s/%s)",
            delay,
            attempt + 1,
            max_retries - 1,
        )
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
