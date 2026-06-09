from datetime import date, datetime
import statistics
from collections import defaultdict

from app.models.weather import WeatherHourly, WeatherDaily


def mean(list)-> float:
    return statistics.mean(list)

def aggregate_hourly_weather_by_day(
    hourly_weather: list[WeatherHourly],
) -> list[WeatherDaily]:
    grouped: dict[
        tuple[int, date],
        list[WeatherHourly],
    ] = defaultdict(list)

    for record in hourly_weather:
        observed_date = datetime.fromisoformat(
            record.observed_at
        ).date()

        grouped[(record.city_id, observed_date)].append(record)

    return [
        WeatherDaily(
            city_id=city_id,
            observed_date=observed_date.isoformat(),
            temperature_2m_mean=mean(
                record.temperature_2m for record in records
            ),
            precipitation_sum=sum(
                record.precipitation for record in records
            ),
            cloud_cover_mean=mean(
                record.cloud_cover for record in records
            ),
            relative_humidity_2m_mean=mean(
                record.relative_humidity_2m for record in records
            ),
            wind_speed_10m_mean=mean(
                record.wind_speed_10m for record in records
            ),
        )
        for (city_id, observed_date), records
        in sorted(grouped.items())
    ]

def get_historical_weather_averages(daily_weather: list[WeatherDaily]) -> dict:
    if not daily_weather:
        return {}

    averages = {}

    averages["city"] = daily_weather[0].city_id
    averages["temperature_2m"] = round(mean([item.temperature_2m_mean for item in daily_weather]),2)
    averages["precipitation"] = round(mean([item.precipitation_sum for item in daily_weather]),2)
    averages["cloud_cover"] = round(mean([item.cloud_cover_mean for item in daily_weather]),2)
    averages["relative_humidity_2m"] = round(mean([item.relative_humidity_2m_mean for item in daily_weather]),2)
    averages["wind_speed_10m"] = round(mean([item.wind_speed_10m_mean for item in daily_weather]),2)

    return averages