import sqlite3
import unittest
from dataclasses import replace
from uuid import uuid4

from psycopg import errors, sql

from app.db.connection import create_connection
from app.db.init_db_postgres import (
    CREATE_CITIES_TABLE,
    CREATE_DAILY_AVERAGES_WEATHER_TABLE,
    CREATE_HOURLY_WEATHER_TABLE,
    CREATE_WIND_ROSE_TABLE,
)
from app.db.init_db_sqlite import add_missing_weather_columns
from app.models.city import CreateCity
from app.models.weather import WeatherDaily, WeatherHourly, WindRoseSector
from app.repositories.city_repository import CityRepository
from app.repositories.weather_repository import WeatherRepository


class WeatherRepositoryTest(unittest.TestCase):
    def setUp(self):
        self.connection = create_connection()
        self.addCleanup(self.connection.close)
        self.addCleanup(self.connection.rollback)
        schema = "test_repository_" + uuid4().hex
        self.connection.execute("SET LOCAL statement_timeout = 10000")
        self.connection.execute(sql.SQL("CREATE SCHEMA {}").format(sql.Identifier(schema)))
        self.connection.execute(
            sql.SQL("SET LOCAL search_path TO {}").format(sql.Identifier(schema))
        )
        self.connection.execute(CREATE_CITIES_TABLE)
        self.connection.execute(CREATE_HOURLY_WEATHER_TABLE)
        self.connection.execute(CREATE_DAILY_AVERAGES_WEATHER_TABLE)
        self.connection.execute(CREATE_WIND_ROSE_TABLE)
        self.connection.execute(
            "INSERT INTO cities (id, name, country_code, latitude, longitude) "
            "VALUES (1, 'Test city', 'RU', 56, 35)"
        )
        self.repository = WeatherRepository(self.connection)

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

    def test_city_crud_and_duplicate_name(self):
        cities = CityRepository(self.connection)
        data = CreateCity(
            slug="new-city", name="New city", country_code="RU", latitude=55.0, longitude=37.0
        )
        # The fixture preserves ID 1, so align the sequence as a migration must do.
        self.connection.execute("SELECT setval(pg_get_serial_sequence('cities', 'id'), 1, true)")
        city = cities.create(data)
        self.assertGreater(city.id, 1)
        self.assertEqual(cities.create(data), city)
        self.assertEqual(cities.get_by_id(city.id), city)
        self.assertEqual(cities.get_by_name_and_country(data.name, data.country_code), city)
        self.assertIn(city, cities.get_all())
        self.assertEqual(cities.update_slug(city.id, "changed").slug, "changed")
        with self.assertRaises(errors.UniqueViolation), self.connection.transaction():
            cities.create(replace(data, name="Different city", slug="changed"))
        with self.assertRaises(errors.CheckViolation), self.connection.transaction():
            cities.create(replace(data, name="Invalid coordinates", latitude=100.0))
        self.assertTrue(cities.delete_by_id(city.id))
        self.assertFalse(cities.delete_by_id(city.id))
        self.assertIsNone(cities.get_by_id(city.id))

    def test_monthly_cloud_cover_boundaries_bias_and_incomplete_days(self):
        records = []
        # January bias -10: clear (0), clear boundary (20), mixed (50),
        # cloudy boundary (80). February bias +10 clips 95 to 100.
        for month, day, cover, hours in [
            (1, 1, 5.0, 2),
            (1, 2, 30.0, 2),
            (1, 3, 60.0, 2),
            (1, 4, 90.0, 2),
            (1, 5, 50.0, 1),
            (1, 6, None, 2),
            (2, 1, 95.0, 2),
        ]:
            for hour in range(hours):
                records.append(
                    replace(
                        self._hourly_weather(direction=0.0, gust=20.0),
                        observed_at=f"2025-{month:02}-{day:02}T{hour:02}:00",
                        cloud_cover=cover,
                    )
                )
        self.repository.create_hourly_many(records)
        args = ((-10.0, 10.0) + (0.0,) * 10, 2, 20.0, 80.0, 50.0, 0)
        self.assertEqual(
            self.repository.get_monthly_cloud_cover_distribution(1, *args),
            [("01", 4, 2, 1, 1), ("02", 1, 0, 0, 1)],
        )
        self.assertEqual(self.repository.get_monthly_cloud_cover_distribution(999, *args), [])

    def test_daily_upsert_update_and_completeness(self):
        record = WeatherDaily(
            city_id=1,
            observed_date="01-01",
            temperature_2m_mean=3.0,
            temperature_2m_max=5.0,
            temperature_2m_min=1.0,
            apparent_temperature_mean=None,
            precipitation_sum=1.0,
            cloud_cover_mean=50.0,
            sunshine_duration_sum=1800.0,
            relative_humidity_2m_mean=70.0,
            wind_speed_10m_mean=10.0,
            wind_direction_10m_dominant=180.0,
            wind_gusts_10m_max=35.0,
        )
        self.assertFalse(self.repository.has_complete_daily_weather(1))
        self.repository.create_daily_averages_many([record])
        self.assertFalse(self.repository.has_complete_daily_apparent_temperature(1))
        self.repository.create_daily_averages_many(
            [replace(record, temperature_2m_mean=99.0, apparent_temperature_mean=2.5)]
        )
        stored = self.repository.get_daily_averages_by_city_id(1)[0]
        self.assertEqual(stored.temperature_2m_mean, 3.0)
        self.assertEqual(stored.apparent_temperature_mean, 2.5)
        self.repository.update_daily_apparent_temperatures(1, {"01-01": 4.0})
        self.assertEqual(
            self.repository.get_daily_averages_by_city_id(1)[0].apparent_temperature_mean, 4.0
        )
        self.assertTrue(self.repository.has_complete_daily_apparent_temperature(1))
        self.assertTrue(self.repository.has_complete_daily_weather(1))
        self.repository.create_daily_averages_many([])
        self.repository.update_daily_apparent_temperatures(1, {})

    def test_empty_hourly_and_wind_rose_replacement(self):
        self.repository.create_hourly_many([])
        self.assertFalse(self.repository.has_complete_hourly_weather(1))
        sectors = [
            WindRoseSector(d, 12.5, 1, 10.0) for d in ("N", "NE", "E", "SE", "S", "SW", "W", "NW")
        ]
        self.repository.replace_wind_rose(1, sectors)
        self.assertTrue(self.repository.has_complete_wind_rose(1))
        self.repository.replace_wind_rose(1, [])
        self.assertEqual(self.repository.get_wind_rose_by_city_id(1), [])
        self.assertFalse(self.repository.has_complete_wind_rose(1))

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


class LegacySQLiteMigrationTest(unittest.TestCase):
    def test_migration_adds_wind_columns_to_old_tables(self):
        connection = sqlite3.connect(":memory:")
        connection.row_factory = sqlite3.Row
        connection.execute("CREATE TABLE hourly_weather (city_id INTEGER, observed_at TEXT)")
        connection.execute(
            "CREATE TABLE daily_averages_weather (city_id INTEGER, observed_date TEXT)"
        )

        add_missing_weather_columns(connection)

        hourly_columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(hourly_weather)")
        }
        daily_columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(daily_averages_weather)")
        }
        connection.close()

        self.assertIn("wind_direction_10m", hourly_columns)
        self.assertIn("wind_gusts_10m", hourly_columns)
        self.assertIn("sunshine_duration", hourly_columns)
        self.assertIn("wind_direction_10m_dominant", daily_columns)
        self.assertIn("wind_gusts_10m_max", daily_columns)
        self.assertIn("sunshine_duration_sum", daily_columns)


if __name__ == "__main__":
    unittest.main()
