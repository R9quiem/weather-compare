import sqlite3
import unittest

from app.db.init_db import (
    CREATE_DAILY_AVERAGES_WEATHER_TABLE,
    CREATE_HOURLY_WEATHER_TABLE,
    CREATE_WIND_ROSE_TABLE,
    add_missing_weather_columns,
)
from app.models.weather import WeatherDaily, WeatherHourly, WindRoseSector
from app.repositories.weather_repository import WeatherRepository


class WeatherRepositoryTest(unittest.TestCase):
    def setUp(self):
        self.connection = sqlite3.connect(":memory:")
        self.connection.row_factory = sqlite3.Row
        self.connection.execute(CREATE_HOURLY_WEATHER_TABLE)
        self.connection.execute(CREATE_DAILY_AVERAGES_WEATHER_TABLE)
        self.connection.execute(CREATE_WIND_ROSE_TABLE)
        self.repository = WeatherRepository(self.connection)

    def tearDown(self):
        self.connection.close()

    def test_upsert_adds_wind_details_to_existing_hourly_row(self):
        base_record = self._hourly_weather()
        self.repository.create_hourly_many([base_record])

        updated_record = self._hourly_weather(direction=225.0, gust=42.0)
        self.repository.create_hourly_many([updated_record])

        stored = self.repository.get_hourly_by_city_id(1)[0]
        self.assertEqual(stored.wind_direction_10m, 225.0)
        self.assertEqual(stored.wind_gusts_10m, 42.0)
        self.assertTrue(self.repository.has_complete_hourly_weather(1))

    def test_daily_wind_details_are_stored(self):
        record = WeatherDaily(
            city_id=1,
            observed_date="01-01",
            temperature_2m_mean=3.0,
            apparent_temperature_mean=2.5,
            temperature_2m_max=5.0,
            temperature_2m_min=1.0,
            precipitation_sum=1.0,
            cloud_cover_mean=50.0,
            sunshine_duration_sum=1800.0,
            relative_humidity_2m_mean=70.0,
            wind_speed_10m_mean=10.0,
            wind_direction_10m_dominant=180.0,
            wind_gusts_10m_max=35.0,
        )

        self.repository.create_daily_averages_many([record])

        stored = self.repository.get_daily_averages_by_city_id(1)[0]
        self.assertEqual(stored.wind_direction_10m_dominant, 180.0)
        self.assertEqual(stored.wind_gusts_10m_max, 35.0)
        self.assertTrue(self.repository.has_complete_daily_weather(1))

    def test_wind_distribution_groups_north_across_zero_degrees(self):
        records = [
            self._hourly_weather_at("2025-01-01T00:00", 350.0, 10.0),
            self._hourly_weather_at("2025-01-01T01:00", 10.0, 20.0),
            self._hourly_weather_at("2025-01-01T02:00", 90.0, 30.0),
        ]
        self.repository.create_hourly_many(records)

        distribution = self.repository.get_wind_direction_distribution(1)

        self.assertEqual(distribution[0], (0, 2, 15.0))
        self.assertEqual(distribution[1], (2, 1, 30.0))

    def test_precomputed_wind_rose_is_stored_and_read(self):
        sectors = [
            WindRoseSector("N", 60.0, 6, 12.0),
            WindRoseSector("S", 40.0, 4, 18.0),
        ]

        self.repository.replace_wind_rose(1, sectors)

        self.assertEqual(self.repository.get_wind_rose_by_city_id(1), sectors)
        self.assertFalse(self.repository.has_complete_wind_rose(1))

    def test_migration_adds_wind_columns_to_old_tables(self):
        connection = sqlite3.connect(":memory:")
        connection.row_factory = sqlite3.Row
        connection.execute(
            "CREATE TABLE hourly_weather (city_id INTEGER, observed_at TEXT)"
        )
        connection.execute(
            "CREATE TABLE daily_averages_weather (city_id INTEGER, observed_date TEXT)"
        )

        add_missing_weather_columns(connection)

        hourly_columns = {
            row["name"]
            for row in connection.execute("PRAGMA table_info(hourly_weather)")
        }
        daily_columns = {
            row["name"]
            for row in connection.execute("PRAGMA table_info(daily_averages_weather)")
        }
        connection.close()

        self.assertIn("wind_direction_10m", hourly_columns)
        self.assertIn("wind_gusts_10m", hourly_columns)
        self.assertIn("sunshine_duration", hourly_columns)
        self.assertIn("wind_direction_10m_dominant", daily_columns)
        self.assertIn("wind_gusts_10m_max", daily_columns)
        self.assertIn("sunshine_duration_sum", daily_columns)

    @staticmethod
    def _hourly_weather(
        direction: float | None = None,
        gust: float | None = None,
    ) -> WeatherHourly:
        return WeatherHourly(
            city_id=1,
            observed_at="2025-01-01T00:00",
            temperature_2m=3.0,
            precipitation=0.0,
            cloud_cover=50.0,
            sunshine_duration=1800.0,
            relative_humidity_2m=70.0,
            wind_speed_10m=10.0,
            wind_direction_10m=direction,
            wind_gusts_10m=gust,
        )

    @staticmethod
    def _hourly_weather_at(
        observed_at: str,
        direction: float,
        speed: float,
    ) -> WeatherHourly:
        return WeatherHourly(
            city_id=1,
            observed_at=observed_at,
            temperature_2m=3.0,
            precipitation=0.0,
            cloud_cover=50.0,
            sunshine_duration=1800.0,
            relative_humidity_2m=70.0,
            wind_speed_10m=speed,
            wind_direction_10m=direction,
            wind_gusts_10m=35.0,
        )


if __name__ == "__main__":
    unittest.main()
