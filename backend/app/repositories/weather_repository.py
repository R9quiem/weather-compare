import sqlite3

from app.models.weather import WeatherDaily, WeatherHourly, WindRoseSector


class WeatherRepository:
    def __init__(self, connection: sqlite3.Connection):
        self.connection = connection

    def create_daily_averages_many(self, data: list[WeatherDaily]):
        self.connection.executemany(
            """
            INSERT INTO daily_averages_weather (
                city_id,
                observed_date,
                temperature_2m_mean,
                temperature_2m_max,
                temperature_2m_min,
                apparent_temperature_mean,
                precipitation_sum,
                cloud_cover_mean,
                sunshine_duration_sum,
                relative_humidity_2m_mean,
                wind_speed_10m_mean,
                wind_direction_10m_dominant,
                wind_gusts_10m_max
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(city_id, observed_date) DO UPDATE SET
                temperature_2m_mean = COALESCE(
                    daily_averages_weather.temperature_2m_mean,
                    excluded.temperature_2m_mean
                ),
                temperature_2m_max = COALESCE(
                    daily_averages_weather.temperature_2m_max,
                    excluded.temperature_2m_max
                ),
                temperature_2m_min = COALESCE(
                    daily_averages_weather.temperature_2m_min,
                    excluded.temperature_2m_min
                ),
                apparent_temperature_mean = COALESCE(
                    daily_averages_weather.apparent_temperature_mean,
                    excluded.apparent_temperature_mean
                ),
                precipitation_sum = COALESCE(
                    daily_averages_weather.precipitation_sum,
                    excluded.precipitation_sum
                ),
                cloud_cover_mean = COALESCE(
                    daily_averages_weather.cloud_cover_mean,
                    excluded.cloud_cover_mean
                ),
                sunshine_duration_sum = COALESCE(
                    daily_averages_weather.sunshine_duration_sum,
                    excluded.sunshine_duration_sum
                ),
                relative_humidity_2m_mean = COALESCE(
                    daily_averages_weather.relative_humidity_2m_mean,
                    excluded.relative_humidity_2m_mean
                ),
                wind_speed_10m_mean = COALESCE(
                    daily_averages_weather.wind_speed_10m_mean,
                    excluded.wind_speed_10m_mean
                ),
                wind_direction_10m_dominant = COALESCE(
                    daily_averages_weather.wind_direction_10m_dominant,
                    excluded.wind_direction_10m_dominant
                ),
                wind_gusts_10m_max = COALESCE(
                    daily_averages_weather.wind_gusts_10m_max,
                    excluded.wind_gusts_10m_max
                )
            """,
            [
                (
                    record.city_id,
                    record.observed_date,
                    record.temperature_2m_mean,
                    record.temperature_2m_max,
                    record.temperature_2m_min,
                    record.apparent_temperature_mean,
                    record.precipitation_sum,
                    record.cloud_cover_mean,
                    record.sunshine_duration_sum,
                    record.relative_humidity_2m_mean,
                    record.wind_speed_10m_mean,
                    record.wind_direction_10m_dominant,
                    record.wind_gusts_10m_max,
                )
                for record in data
            ],
        )

    def update_daily_apparent_temperatures(
        self,
        city_id: int,
        values_by_day: dict[str, float],
    ) -> None:
        self.connection.executemany(
            """
            UPDATE daily_averages_weather
            SET apparent_temperature_mean = ?
            WHERE city_id = ? AND observed_date = ?
            """,
            [
                (value, city_id, observed_date)
                for observed_date, value in values_by_day.items()
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
                apparent_temperature_mean,
                precipitation_sum,
                cloud_cover_mean,
                sunshine_duration_sum,
                relative_humidity_2m_mean,
                wind_speed_10m_mean,
                wind_direction_10m_dominant,
                wind_gusts_10m_max
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
                apparent_temperature_mean=row["apparent_temperature_mean"],
                precipitation_sum=row["precipitation_sum"],
                cloud_cover_mean=row["cloud_cover_mean"],
                sunshine_duration_sum=row["sunshine_duration_sum"],
                relative_humidity_2m_mean=row["relative_humidity_2m_mean"],
                wind_speed_10m_mean=row["wind_speed_10m_mean"],
                wind_direction_10m_dominant=row["wind_direction_10m_dominant"],
                wind_gusts_10m_max=row["wind_gusts_10m_max"],
            )
            for row in rows
        ]

    def create_hourly_many(self, data: list[WeatherHourly]):
        self.connection.executemany(
            """
            INSERT INTO hourly_weather (
                city_id,
                observed_at,
                temperature_2m,
                precipitation,
                cloud_cover,
                sunshine_duration,
                relative_humidity_2m,
                wind_speed_10m,
                wind_direction_10m,
                wind_gusts_10m
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(city_id, observed_at) DO UPDATE SET
                temperature_2m = COALESCE(
                    hourly_weather.temperature_2m,
                    excluded.temperature_2m
                ),
                precipitation = COALESCE(
                    hourly_weather.precipitation,
                    excluded.precipitation
                ),
                cloud_cover = COALESCE(
                    hourly_weather.cloud_cover,
                    excluded.cloud_cover
                ),
                sunshine_duration = COALESCE(
                    hourly_weather.sunshine_duration,
                    excluded.sunshine_duration
                ),
                relative_humidity_2m = COALESCE(
                    hourly_weather.relative_humidity_2m,
                    excluded.relative_humidity_2m
                ),
                wind_speed_10m = COALESCE(
                    hourly_weather.wind_speed_10m,
                    excluded.wind_speed_10m
                ),
                wind_direction_10m = COALESCE(
                    hourly_weather.wind_direction_10m,
                    excluded.wind_direction_10m
                ),
                wind_gusts_10m = COALESCE(
                    hourly_weather.wind_gusts_10m,
                    excluded.wind_gusts_10m
                )
            """,
            [
                (
                    record.city_id,
                    record.observed_at,
                    record.temperature_2m,
                    record.precipitation,
                    record.cloud_cover,
                    record.sunshine_duration,
                    record.relative_humidity_2m,
                    record.wind_speed_10m,
                    record.wind_direction_10m,
                    record.wind_gusts_10m,
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
                sunshine_duration,
                relative_humidity_2m,
                wind_speed_10m,
                wind_direction_10m,
                wind_gusts_10m
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
                sunshine_duration=row["sunshine_duration"],
                relative_humidity_2m=row["relative_humidity_2m"],
                wind_speed_10m=row["wind_speed_10m"],
                wind_direction_10m=row["wind_direction_10m"],
                wind_gusts_10m=row["wind_gusts_10m"],
            )
            for row in rows
        ]

    def get_wind_direction_distribution(
        self,
        city_id: int,
    ) -> list[tuple[int, int, float | None]]:
        rows = self.connection.execute(
            """
            WITH wind_observations AS (
                SELECT
                    CASE
                        WHEN wind_direction_10m < 22.5
                            OR wind_direction_10m >= 337.5 THEN 0
                        WHEN wind_direction_10m < 67.5 THEN 1
                        WHEN wind_direction_10m < 112.5 THEN 2
                        WHEN wind_direction_10m < 157.5 THEN 3
                        WHEN wind_direction_10m < 202.5 THEN 4
                        WHEN wind_direction_10m < 247.5 THEN 5
                        WHEN wind_direction_10m < 292.5 THEN 6
                        ELSE 7
                    END AS sector,
                    wind_speed_10m
                FROM hourly_weather
                WHERE city_id = ?
                  AND wind_direction_10m IS NOT NULL
            )
            SELECT
                sector,
                COUNT(*) AS sample_count,
                AVG(wind_speed_10m) AS average_speed
            FROM wind_observations
            GROUP BY sector
            ORDER BY sector
            """,
            (city_id,),
        ).fetchall()

        return [
            (row["sector"], row["sample_count"], row["average_speed"]) for row in rows
        ]

    def get_monthly_cloud_cover_distribution(
        self,
        city_id: int,
        monthly_biases: tuple[float, ...],
        expected_hours: int,
        clear_daily_mean_max: float,
        cloudy_daily_mean_min: float,
        opposite_hour_boundary: float,
        max_cloudy_hours_in_clear_day: int,
    ) -> list[tuple[str, int, int, int, int]]:
        rows = self.connection.execute(
            """
            WITH adjusted_hourly_cloud_cover AS (
                SELECT
                    observed_at,
                    MIN(
                        100,
                        MAX(
                            0,
                            cloud_cover + CASE substr(observed_at, 6, 2)
                                WHEN '01' THEN ? WHEN '02' THEN ?
                                WHEN '03' THEN ? WHEN '04' THEN ?
                                WHEN '05' THEN ? WHEN '06' THEN ?
                                WHEN '07' THEN ? WHEN '08' THEN ?
                                WHEN '09' THEN ? WHEN '10' THEN ?
                                WHEN '11' THEN ? WHEN '12' THEN ?
                                ELSE 0
                            END
                        )
                    ) AS cloud_cover
                FROM hourly_weather
                WHERE city_id = ?
                  AND cloud_cover IS NOT NULL
            ),
            daily_cloud_cover AS (
                SELECT
                    substr(observed_at, 1, 10) AS day,
                    substr(observed_at, 6, 2) AS month,
                    COUNT(*) AS observed_hours,
                    SUM(cloud_cover) AS cloud_cover_sum,
                    SUM(cloud_cover > ?) AS hours_above_boundary
                FROM adjusted_hourly_cloud_cover
                GROUP BY day, month
                HAVING observed_hours = ?
            )
            SELECT
                month,
                COUNT(*) AS total_days,
                SUM(
                    cloud_cover_sum <= ? * ?
                    AND hours_above_boundary <= ?
                ) AS clear_days,
                SUM(
                    NOT (
                        cloud_cover_sum <= ? * ?
                        AND hours_above_boundary <= ?
                    )
                    AND cloud_cover_sum < ? * ?
                ) AS partly_cloudy_days,
                SUM(cloud_cover_sum >= ? * ?) AS cloudy_days
            FROM daily_cloud_cover
            GROUP BY month
            ORDER BY month
            """,
            (
                *monthly_biases,
                city_id,
                opposite_hour_boundary,
                expected_hours,
                clear_daily_mean_max,
                expected_hours,
                max_cloudy_hours_in_clear_day,
                clear_daily_mean_max,
                expected_hours,
                max_cloudy_hours_in_clear_day,
                cloudy_daily_mean_min,
                expected_hours,
                cloudy_daily_mean_min,
                expected_hours,
            ),
        ).fetchall()

        return [
            (
                row["month"],
                row["total_days"],
                row["clear_days"],
                row["partly_cloudy_days"],
                row["cloudy_days"],
            )
            for row in rows
        ]

    def replace_wind_rose(
        self,
        city_id: int,
        sectors: list[WindRoseSector],
    ) -> None:
        self.connection.execute(
            "DELETE FROM wind_rose WHERE city_id = ?",
            (city_id,),
        )
        self.connection.executemany(
            """
            INSERT INTO wind_rose (
                city_id,
                direction,
                frequency,
                sample_count,
                average_speed
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            [
                (
                    city_id,
                    sector.direction,
                    sector.frequency,
                    sector.sample_count,
                    sector.average_speed,
                )
                for sector in sectors
            ],
        )

    def get_wind_rose_by_city_id(self, city_id: int) -> list[WindRoseSector]:
        rows = self.connection.execute(
            """
            SELECT direction, frequency, sample_count, average_speed
            FROM wind_rose
            WHERE city_id = ?
            ORDER BY CASE direction
                WHEN 'N' THEN 0
                WHEN 'NE' THEN 1
                WHEN 'E' THEN 2
                WHEN 'SE' THEN 3
                WHEN 'S' THEN 4
                WHEN 'SW' THEN 5
                WHEN 'W' THEN 6
                WHEN 'NW' THEN 7
            END
            """,
            (city_id,),
        ).fetchall()

        return [
            WindRoseSector(
                direction=row["direction"],
                frequency=row["frequency"],
                sample_count=row["sample_count"],
                average_speed=row["average_speed"],
            )
            for row in rows
        ]

    def has_complete_wind_rose(self, city_id: int) -> bool:
        row = self.connection.execute(
            """
            SELECT COUNT(*) AS sectors
            FROM wind_rose
            WHERE city_id = ?
            """,
            (city_id,),
        ).fetchone()

        return row["sectors"] == 8

    def has_complete_hourly_weather(self, city_id: int) -> bool:
        row = self.connection.execute(
            """
            SELECT
                COUNT(*) AS total_rows,
                COUNT(temperature_2m) AS temperature_rows,
                COUNT(precipitation) AS precipitation_rows,
                COUNT(cloud_cover) AS cloud_cover_rows,
                COUNT(sunshine_duration) AS sunshine_rows,
                COUNT(relative_humidity_2m) AS humidity_rows,
                COUNT(wind_speed_10m) AS wind_speed_rows,
                COUNT(wind_direction_10m) AS directions,
                COUNT(wind_gusts_10m) AS gusts
            FROM hourly_weather
            WHERE city_id = ?
            """,
            (city_id,),
        ).fetchone()

        return row["total_rows"] > 0 and all(
            row[column] == row["total_rows"]
            for column in (
                "temperature_rows",
                "precipitation_rows",
                "cloud_cover_rows",
                "sunshine_rows",
                "humidity_rows",
                "wind_speed_rows",
                "directions",
                "gusts",
            )
        )

    def has_complete_daily_weather(self, city_id: int) -> bool:
        row = self.connection.execute(
            """
            SELECT
                COUNT(*) AS total_rows,
                COUNT(temperature_2m_mean) AS temperature_mean_rows,
                COUNT(temperature_2m_max) AS temperature_max_rows,
                COUNT(temperature_2m_min) AS temperature_min_rows,
                COUNT(precipitation_sum) AS precipitation_rows,
                COUNT(cloud_cover_mean) AS cloud_cover_rows,
                COUNT(sunshine_duration_sum) AS sunshine_rows,
                COUNT(relative_humidity_2m_mean) AS humidity_rows,
                COUNT(wind_speed_10m_mean) AS wind_speed_rows,
                COUNT(wind_direction_10m_dominant) AS directions,
                COUNT(wind_gusts_10m_max) AS gusts
            FROM daily_averages_weather
            WHERE city_id = ?
            """,
            (city_id,),
        ).fetchone()

        return row["total_rows"] > 0 and all(
            row[column] == row["total_rows"]
            for column in (
                "temperature_mean_rows",
                "temperature_max_rows",
                "temperature_min_rows",
                "precipitation_rows",
                "cloud_cover_rows",
                "sunshine_rows",
                "humidity_rows",
                "wind_speed_rows",
                "directions",
                "gusts",
            )
        )

    def has_complete_daily_apparent_temperature(self, city_id: int) -> bool:
        row = self.connection.execute(
            """
            SELECT
                COUNT(*) AS total_rows,
                COUNT(apparent_temperature_mean) AS apparent_temperature_rows
            FROM daily_averages_weather
            WHERE city_id = ?
            """,
            (city_id,),
        ).fetchone()

        return (
            row["total_rows"] > 0
            and row["apparent_temperature_rows"] == row["total_rows"]
        )
