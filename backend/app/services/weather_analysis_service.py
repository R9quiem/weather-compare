from datetime import date, datetime
import statistics
from collections import defaultdict

from app.models.weather import WeatherHourly, WeatherDaily


def mean(list) -> float:
    return statistics.mean(list)


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

    return [
        WeatherDaily(
            city_id=city_id,
            observed_date=observed_date.isoformat(),
            temperature_2m_mean=mean(record.temperature_2m for record in records),
            temperature_2m_max=max(record.temperature_2m for record in records),
            temperature_2m_min=min(record.temperature_2m for record in records),
            precipitation_sum=sum(record.precipitation for record in records),
            cloud_cover_mean=mean(record.cloud_cover for record in records),
            relative_humidity_2m_mean=mean(
                record.relative_humidity_2m for record in records
            ),
            wind_speed_10m_mean=mean(record.wind_speed_10m for record in records),
        )
        for (city_id, observed_date), records in sorted(grouped.items())
    ]


def get_historical_weather_averages(daily_weather: list[WeatherDaily]) -> dict:

    averages = {}

    averages["city"] = daily_weather[0].city_id
    averages["temperature_2m"] = round(
        mean([item.temperature_2m_mean for item in daily_weather]), 2
    )
    averages["precipitation"] = round(
        mean([item.precipitation_sum for item in daily_weather]), 2
    )
    averages["cloud_cover"] = round(
        mean([item.cloud_cover_mean for item in daily_weather]), 2
    )
    averages["relative_humidity_2m"] = round(
        mean([item.relative_humidity_2m_mean for item in daily_weather]), 2
    )
    averages["wind_speed_10m"] = round(
        mean([item.wind_speed_10m_mean for item in daily_weather]), 2
    )
    averages["temperature_2m_max"] = round(
        mean([item.temperature_2m_max for item in daily_weather]), 2
    )
    averages["temperature_2m_min"] = round(
        mean([item.temperature_2m_min for item in daily_weather]), 2
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

        string_key = f"{record[0]:02d}-{record[1]:02d}"

        daily_averages[string_key] = WeatherDaily(
            city_id=records_list[0].city_id,
            observed_date=records_list[0].observed_date[5:],
            temperature_2m_mean=round(
                mean(item.temperature_2m_mean for item in records_list), 2
            ),
            temperature_2m_max=round(
                mean(item.temperature_2m_max for item in records_list), 2
            ),
            temperature_2m_min=round(
                mean(item.temperature_2m_min for item in records_list), 2
            ),
            precipitation_sum=round(
                mean(item.precipitation_sum for item in records_list), 2
            ),
            cloud_cover_mean=round(
                mean(item.cloud_cover_mean for item in records_list), 2
            ),
            relative_humidity_2m_mean=round(
                mean(item.relative_humidity_2m_mean for item in records_list), 2
            ),
            wind_speed_10m_mean=round(
                mean(item.wind_speed_10m_mean for item in records_list), 2
            ),
        )

    return daily_averages
