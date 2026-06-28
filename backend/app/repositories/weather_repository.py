import sqlite3

from app.models.weather import WeatherHourly, WeatherDaily


class WeatherRepository:
    def __init__(self, connection: sqlite3.Connection):
        self.connection = connection

    def create_daily_averages_many(self,data: list[WeatherDaily]):
        self.connection.executemany(
            """
            INSERT OR IGNORE INTO daily_averages_weather (
                city_id,
                observed_date,
                temperature_2m_mean,
                temperature_2m_max,
                temperature_2m_min,
                precipitation_sum,
                cloud_cover_mean,
                relative_humidity_2m_mean,
                wind_speed_10m_mean
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, [
                (
                    record.city_id,
                    record.observed_date,
                    record.temperature_2m_mean,
                    record.temperature_2m_max,
                    record.temperature_2m_min,
                    record.precipitation_sum,
                    record.cloud_cover_mean,
                    record.relative_humidity_2m_mean,
                    record.wind_speed_10m_mean
                )
                for record in data
            ],
        )

    def get_daily_averages_by_city_id(self, city_id: int) -> list[WeatherDaily]:
        cursor = self.connection.execute(
            """
            SELECT
                city_id, 
                observed_date, 
                temperature_2m_mean,
                temperature_2m_max,
                temperature_2m_min,
                precipitation_sum,
                cloud_cover_mean,
                relative_humidity_2m_mean,
                wind_speed_10m_mean
            FROM daily_averages_weather
            WHERE city_id = ?
            ORDER BY observed_date
            """,
            (city_id,),
        )

        rows = cursor.fetchall()

        return [
            WeatherDaily(
                city_id=row["city_id"],
                observed_date=row["observed_date"],
                temperature_2m_mean=row["temperature_2m_mean"],
                temperature_2m_max=row["temperature_2m_max"],
                temperature_2m_min=row["temperature_2m_min"],
                precipitation_sum=row["precipitation_sum"],
                cloud_cover_mean=row["cloud_cover_mean"],
                relative_humidity_2m_mean=row["relative_humidity_2m_mean"],
                wind_speed_10m_mean=row["wind_speed_10m_mean"],
            )
            for row in rows
        ]

    def create_hourly_many(self, data: list[WeatherHourly]):
        self.connection.executemany(
            """
            INSERT OR IGNORE INTO hourly_weather (
                city_id,
                observed_at,
                temperature_2m,
                precipitation,
                cloud_cover,
                relative_humidity_2m,
                wind_speed_10m
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    record.city_id,
                    record.observed_at,
                    record.temperature_2m,
                    record.precipitation,
                    record.cloud_cover,
                    record.relative_humidity_2m,
                    record.wind_speed_10m,
                )
                for record in data
            ],
        )

    def get_hourly_by_city_id(self, city_id: int) -> list[WeatherHourly]:
        cursor = self.connection.execute(
            """
            SELECT
                city_id, 
                observed_at, 
                temperature_2m,
                precipitation,
                cloud_cover,
                relative_humidity_2m,
                wind_speed_10m
            FROM hourly_weather
            WHERE city_id = ?
            ORDER BY observed_at
            """,
            (city_id,),
        )

        rows = cursor.fetchall()

        return [
            WeatherHourly(
                city_id=row["city_id"],
                observed_at=row["observed_at"],
                temperature_2m=row["temperature_2m"],
                precipitation=row["precipitation"],
                cloud_cover=row["cloud_cover"],
                relative_humidity_2m=row["relative_humidity_2m"],
                wind_speed_10m=row["wind_speed_10m"],
            )
            for row in rows
        ]
