import unittest

from app.models.weather import WeatherDaily, WeatherHourly
from app.services.weather_analysis_service import (
    aggregate_hourly_weather_by_day,
    calculate_daily_weather_averages,
    circular_mean_degrees,
)


class WindAggregationTest(unittest.TestCase):
    def test_circular_mean_wraps_around_north(self):
        result = circular_mean_degrees([350.0, 10.0], [10.0, 10.0])

        self.assertEqual(result, 0.0)

    def test_hourly_data_produces_daily_gust_and_direction(self):
        hourly_weather = [
            WeatherHourly(
                city_id=1,
                observed_at="2025-01-01T00:00",
                temperature_2m=2.0,
                precipitation=0.0,
                cloud_cover=50.0,
                sunshine_duration=0.0,
                relative_humidity_2m=80.0,
                wind_speed_10m=10.0,
                wind_direction_10m=350.0,
                wind_gusts_10m=20.0,
            ),
            WeatherHourly(
                city_id=1,
                observed_at="2025-01-01T01:00",
                temperature_2m=4.0,
                precipitation=1.0,
                cloud_cover=60.0,
                sunshine_duration=1800.0,
                relative_humidity_2m=70.0,
                wind_speed_10m=10.0,
                wind_direction_10m=10.0,
                wind_gusts_10m=30.0,
            ),
        ]

        result = aggregate_hourly_weather_by_day(hourly_weather)[0]

        self.assertEqual(result.wind_direction_10m_dominant, 0.0)
        self.assertEqual(result.wind_gusts_10m_max, 30.0)

    def test_climate_data_averages_daily_gust_maxima(self):
        daily_weather = [
            self._daily_weather("2024-01-01", 350.0, 30.0),
            self._daily_weather("2025-01-01", 10.0, 40.0),
        ]

        result = calculate_daily_weather_averages(daily_weather)["01-01"]

        self.assertEqual(result.wind_direction_10m_dominant, 0.0)
        self.assertEqual(result.wind_gusts_10m_max, 35.0)

    def test_hourly_aggregation_ignores_missing_values(self):
        record = WeatherHourly(
            city_id=1,
            observed_at="2025-01-01T00:00",
            temperature_2m=2.0,
            precipitation=None,
            cloud_cover=None,
            sunshine_duration=0.0,
            relative_humidity_2m=80.0,
            wind_speed_10m=10.0,
        )

        result = aggregate_hourly_weather_by_day([record])[0]

        self.assertIsNone(result.precipitation_sum)
        self.assertIsNone(result.cloud_cover_mean)

    @staticmethod
    def _daily_weather(
        observed_date: str,
        direction: float,
        gust: float,
    ) -> WeatherDaily:
        return WeatherDaily(
            city_id=1,
            observed_date=observed_date,
            temperature_2m_mean=3.0,
            apparent_temperature_mean=2.5,
            temperature_2m_max=5.0,
            temperature_2m_min=1.0,
            precipitation_sum=1.0,
            cloud_cover_mean=50.0,
            sunshine_duration_sum=1800.0,
            relative_humidity_2m_mean=70.0,
            wind_speed_10m_mean=10.0,
            wind_direction_10m_dominant=direction,
            wind_gusts_10m_max=gust,
        )


if __name__ == "__main__":
    unittest.main()
