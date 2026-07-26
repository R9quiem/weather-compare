from collections import defaultdict
from datetime import date, datetime
import math
import statistics

from app.models.weather import WeatherHourly, WeatherDaily


def mean(values) -> float | None:
    present_values = [value for value in values if value is not None]
    return statistics.mean(present_values) if present_values else None


def rounded_mean(values) -> float | None:
    result = mean(values)
    return round(result, 2) if result is not None else None


def maximum(values) -> float | None:
    present_values = [value for value in values if value is not None]
    return max(present_values) if present_values else None


def minimum(values) -> float | None:
    present_values = [value for value in values if value is not None]
    return min(present_values) if present_values else None


def total(values) -> float | None:
    present_values = [value for value in values if value is not None]
    return sum(present_values) if present_values else None


def circular_mean_degrees(
    directions: list[float | None],
    weights: list[float | None] | None = None,
) -> float | None:
    """Calculate a circular mean where 0 and 360 degrees are adjacent."""
    if weights is None:
        weights = [1.0] * len(directions)

    vectors = [
        (direction, weight)
        for direction, weight in zip(directions, weights, strict=True)
        if direction is not None and weight is not None and weight > 0
    ]

    if not vectors:
        return None

    x = sum(math.cos(math.radians(direction)) * weight for direction, weight in vectors)
    y = sum(math.sin(math.radians(direction)) * weight for direction, weight in vectors)

    if math.isclose(x, 0.0, abs_tol=1e-12) and math.isclose(y, 0.0, abs_tol=1e-12):
        return None

    direction = round(math.degrees(math.atan2(y, x)) % 360, 2)
    return 0.0 if direction == 360.0 else direction


def aggregate_hourly_weather_by_day(
    hourly_weather: list[WeatherHourly],
) -> list[WeatherDaily]:
    grouped: dict[
        tuple[int, date],
        list[WeatherHourly],
    ] = defaultdict(list)

    for record in hourly_weather:
        observed_date = datetime.fromisoformat(record.observed_at).date()

        grouped[(record.city_id, observed_date)].append(record)

    daily_weather = []

    for (city_id, observed_date), records in sorted(grouped.items()):
        gusts = [
            record.wind_gusts_10m
            for record in records
            if record.wind_gusts_10m is not None
        ]

        daily_weather.append(
            WeatherDaily(
                city_id=city_id,
                observed_date=observed_date.isoformat(),
                temperature_2m_mean=mean(record.temperature_2m for record in records),
                temperature_2m_max=maximum(record.temperature_2m for record in records),
                temperature_2m_min=minimum(record.temperature_2m for record in records),
                apparent_temperature_mean=None,
                precipitation_sum=total(record.precipitation for record in records),
                cloud_cover_mean=mean(record.cloud_cover for record in records),
                sunshine_duration_sum=total(
                    record.sunshine_duration for record in records
                ),
                relative_humidity_2m_mean=mean(
                    record.relative_humidity_2m for record in records
                ),
                wind_speed_10m_mean=mean(record.wind_speed_10m for record in records),
                wind_direction_10m_dominant=circular_mean_degrees(
                    [record.wind_direction_10m for record in records],
                    [record.wind_speed_10m for record in records],
                ),
                wind_gusts_10m_max=max(gusts) if gusts else None,
            )
        )

    return daily_weather


def get_historical_weather_averages(daily_weather: list[WeatherDaily]) -> dict:

    averages = {}

    averages["city"] = daily_weather[0].city_id
    averages["temperature_2m"] = rounded_mean(
        item.temperature_2m_mean for item in daily_weather
    )
    averages["precipitation"] = rounded_mean(
        item.precipitation_sum for item in daily_weather
    )
    averages["cloud_cover"] = rounded_mean(
        item.cloud_cover_mean for item in daily_weather
    )
    averages["sunshine_duration"] = rounded_mean(
        item.sunshine_duration_sum for item in daily_weather
    )
    averages["relative_humidity_2m"] = rounded_mean(
        item.relative_humidity_2m_mean for item in daily_weather
    )
    averages["wind_speed_10m"] = rounded_mean(
        item.wind_speed_10m_mean for item in daily_weather
    )
    gusts = [
        item.wind_gusts_10m_max
        for item in daily_weather
        if item.wind_gusts_10m_max is not None
    ]
    averages["wind_gusts_10m"] = rounded_mean(gusts)
    averages["wind_direction_10m"] = circular_mean_degrees(
        [item.wind_direction_10m_dominant for item in daily_weather],
        [item.wind_speed_10m_mean for item in daily_weather],
    )
    averages["temperature_2m_max"] = rounded_mean(
        item.temperature_2m_max for item in daily_weather
    )
    averages["temperature_2m_min"] = rounded_mean(
        item.temperature_2m_min for item in daily_weather
    )
    averages["apparent_temperature"] = rounded_mean(
        item.apparent_temperature_mean for item in daily_weather
    )

    return averages


def calculate_daily_weather_averages(daily_weather: list[WeatherDaily]) -> dict:
    # weather data grouped by day of year (month, day)
    grouped: dict[
        tuple[int, int],
        list[WeatherDaily],
    ] = defaultdict(list)

    for record in daily_weather:
        observed_date = datetime.fromisoformat(record.observed_date).date()
        grouped[(observed_date.month, observed_date.day)].append(record)

    # weather averages for every day of the year
    daily_averages: dict[
        str,
        WeatherDaily,
    ] = {}

    for record in sorted(grouped):
        records_list = grouped[record]
        gusts = [
            item.wind_gusts_10m_max
            for item in records_list
            if item.wind_gusts_10m_max is not None
        ]

        string_key = f"{record[0]:02d}-{record[1]:02d}"

        daily_averages[string_key] = WeatherDaily(
            city_id=records_list[0].city_id,
            observed_date=records_list[0].observed_date[5:],
            temperature_2m_mean=rounded_mean(
                item.temperature_2m_mean for item in records_list
            ),
            temperature_2m_max=rounded_mean(
                item.temperature_2m_max for item in records_list
            ),
            temperature_2m_min=rounded_mean(
                item.temperature_2m_min for item in records_list
            ),
            apparent_temperature_mean=rounded_mean(
                item.apparent_temperature_mean for item in records_list
            ),
            precipitation_sum=rounded_mean(
                item.precipitation_sum for item in records_list
            ),
            cloud_cover_mean=rounded_mean(
                item.cloud_cover_mean for item in records_list
            ),
            sunshine_duration_sum=rounded_mean(
                item.sunshine_duration_sum for item in records_list
            ),
            relative_humidity_2m_mean=rounded_mean(
                item.relative_humidity_2m_mean for item in records_list
            ),
            wind_speed_10m_mean=rounded_mean(
                item.wind_speed_10m_mean for item in records_list
            ),
            wind_direction_10m_dominant=circular_mean_degrees(
                [item.wind_direction_10m_dominant for item in records_list],
                [item.wind_speed_10m_mean for item in records_list],
            ),
            wind_gusts_10m_max=rounded_mean(gusts),
        )

    return daily_averages
