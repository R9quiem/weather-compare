import logging
import statistics
import time
from datetime import UTC, datetime, timedelta
from email.utils import parsedate_to_datetime

import requests

from app.models.weather import WeatherHourly

logger = logging.getLogger(__name__)


def get_retry_delay(response: requests.Response, attempt: int) -> float:
    retry_after = response.headers.get("Retry-After")

    if retry_after is not None:
        try:
            return max(float(retry_after), 1.0)
        except ValueError:
            try:
                retry_at = parsedate_to_datetime(retry_after)
                if retry_at.tzinfo is None:
                    retry_at = retry_at.replace(tzinfo=UTC)
                return max(
                    (retry_at.astimezone(UTC) - datetime.now(UTC)).total_seconds(),
                    1.0,
                )
            except (TypeError, ValueError, OverflowError):
                pass

    try:
        reason = response.json().get("reason", "").lower()
    except requests.JSONDecodeError:
        reason = ""

    now = datetime.now(UTC)

    if "minutely api request limit" in reason or "minute api request limit" in reason:
        next_utc_minute = now.replace(second=0, microsecond=0) + timedelta(minutes=1)
        return max((next_utc_minute - now).total_seconds() + 5, 1.0)

    if "hourly api request limit" in reason:
        next_utc_hour = now.replace(minute=0, second=0, microsecond=0) + timedelta(
            hours=1
        )
        return max((next_utc_hour - now).total_seconds() + 30, 1.0)

    if "daily api request limit" in reason:
        next_utc_day = datetime.combine(
            now.date() + timedelta(days=1),
            datetime.min.time(),
            tzinfo=UTC,
        )
        return max((next_utc_day - now).total_seconds() + 5 * 60, 60.0)

    if "monthly api request limit" in reason:
        if now.month == 12:
            next_utc_month = datetime(now.year + 1, 1, 1, tzinfo=UTC)
        else:
            next_utc_month = datetime(now.year, now.month + 1, 1, tzinfo=UTC)
        return max((next_utc_month - now).total_seconds() + 5 * 60, 60.0)

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
        "models": "era5",
    }
    response = request_with_retry(url, params)
    hourly = response.json()["hourly"]

    expected_length = len(hourly.get("time", []))

    if expected_length == 0:
        raise ValueError(f"Open-Meteo returned no hourly data for city {city_id}")

    for variable in hourly_variables:
        values = hourly.get(variable)

        if values is None or len(values) != expected_length:
            raise ValueError(
                f"Open-Meteo returned incomplete {variable} data for city {city_id}"
            )

        missing_values = sum(value is None for value in values)
        if missing_values:
            raise ValueError(
                f"Open-Meteo returned {missing_values} null values "
                f"for {variable} in city {city_id}"
            )

    rows: list[WeatherHourly] = []

    for i in range(len(hourly["time"])):
        row = WeatherHourly(
            city_id=city_id,
            observed_at=hourly["time"][i],
            temperature_2m=hourly["temperature_2m"][i],
            precipitation=hourly["precipitation"][i],
            cloud_cover=hourly["cloud_cover"][i],
            sunshine_duration=hourly["sunshine_duration"][i],
            relative_humidity_2m=hourly["relative_humidity_2m"][i],
            wind_speed_10m=hourly["wind_speed_10m"][i],
            wind_direction_10m=hourly["wind_direction_10m"][i],
            wind_gusts_10m=hourly["wind_gusts_10m"][i],
        )

        rows.append(row)

    return rows


def load_daily_apparent_temperature(
    latitude: float,
    longitude: float,
    start_date: str,
    end_date: str,
) -> dict[str, float]:
    response = request_with_retry(
        "https://archive-api.open-meteo.com/v1/archive",
        {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": start_date,
            "end_date": end_date,
            "daily": "apparent_temperature_mean",
            "timezone": "auto",
            "models": "era5",
        },
    )
    daily = response.json()["daily"]
    dates = daily.get("time", [])
    values = daily.get("apparent_temperature_mean", [])

    if not dates or len(dates) != len(values):
        raise ValueError("Open-Meteo returned incomplete apparent temperature data")

    grouped: dict[str, list[float]] = {}
    for observed_date, value in zip(dates, values, strict=True):
        if value is None:
            continue
        grouped.setdefault(observed_date[5:], []).append(value)

    return {
        observed_date: round(statistics.mean(day_values), 2)
        for observed_date, day_values in grouped.items()
    }
