from app.models.weather import WeatherDaily, WeatherHourly
from app.services.weather_analysis_service import (
    aggregate_hourly_weather_by_day,
    calculate_daily_weather_averages,
)


def make_hourly(observed_at: str, **changes) -> WeatherHourly:
    values = {
        "city_id": 1,
        "observed_at": observed_at,
        "temperature_2m": 3.0,
        "precipitation": 0.0,
        "cloud_cover": 50.0,
        "sunshine_duration": 1800.0,
        "relative_humidity_2m": 70.0,
        "wind_speed_10m": 10.0,
        "wind_direction_10m": 180.0,
        "wind_gusts_10m": 20.0,
    }

    values.update(changes)
    return WeatherHourly(**values)


def make_daily(observed_date: str, **changes) -> WeatherDaily:
    values = {
        "city_id": 1,
        "observed_date": observed_date,
        "temperature_2m_mean": 3.0,
        "temperature_2m_max": 5.0,
        "temperature_2m_min": 1.0,
        "apparent_temperature_mean": 2.0,
        "precipitation_sum": 1.0,
        "cloud_cover_mean": 50.0,
        "sunshine_duration_sum": 1800.0,
        "relative_humidity_2m_mean": 70.0,
        "wind_speed_10m_mean": 10.0,
        "wind_direction_10m_dominant": 180.0,
        "wind_gusts_10m_max": 20.0,
    }

    values.update(changes)
    return WeatherDaily(**values)


def test_aggregates_hourly_weather_for_one_day():
    weather = [
        make_hourly(
            "2025-01-01T00:00",
            temperature_2m=2.0,
            precipitation=0.5,
            cloud_cover=20.0,
            sunshine_duration=1200.0,
            relative_humidity_2m=80.0,
            wind_speed_10m=10.0,
            wind_gusts_10m=20.0,
        ),
        make_hourly(
            "2025-01-01T01:00",
            temperature_2m=6.0,
            precipitation=1.5,
            cloud_cover=60.0,
            sunshine_duration=2400.0,
            relative_humidity_2m=60.0,
            wind_speed_10m=20.0,
            wind_gusts_10m=30.0,
        ),
    ]

    result = aggregate_hourly_weather_by_day(weather)

    assert len(result) == 1

    day = result[0]

    assert day.observed_date == "2025-01-01"
    assert day.temperature_2m_mean == 4.0
    assert day.temperature_2m_min == 2.0
    assert day.temperature_2m_max == 6.0
    assert day.precipitation_sum == 2.0
    assert day.cloud_cover_mean == 40.0
    assert day.sunshine_duration_sum == 3600.0
    assert day.relative_humidity_2m_mean == 70.0
    assert day.wind_speed_10m_mean == 15.0
    assert day.wind_gusts_10m_max == 30.0


def test_does_not_mix_different_days():
    weather = [
        make_hourly("2025-01-01T23:00"),
        make_hourly("2025-01-02T00:00"),
    ]

    result = aggregate_hourly_weather_by_day(weather)

    assert len(result) == 2
    assert result[0].observed_date == "2025-01-01"
    assert result[1].observed_date == "2025-01-02"


def test_averages_same_calendar_day_across_years():
    weather = [
        make_daily("2024-01-01", temperature_2m_mean=0.0),
        make_daily("2025-01-01", temperature_2m_mean=4.0),
    ]

    result = calculate_daily_weather_averages(weather)

    assert result["01-01"].temperature_2m_mean == 2.0


def test_ignores_missing_values():
    weather = [
        make_hourly(
            "2025-01-01T00:00",
            precipitation=None,
            cloud_cover=None,
        ),
    ]

    result = aggregate_hourly_weather_by_day(weather)[0]

    assert result.precipitation_sum is None
    assert result.cloud_cover_mean is None


def test_returns_empty_list_for_empty_hourly_weather():
    result = aggregate_hourly_weather_by_day([])

    assert result == []
