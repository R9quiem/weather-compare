import sqlite3

from app.models.weather import WeatherDaily, WeatherHourly, WindRoseSector
from app.repositories.weather_repository import WeatherRepository


class WeatherService:
    WIND_DIRECTIONS = ("N", "NE", "E", "SE", "S", "SW", "W", "NW")
    CLOUD_COVER_HOURS_PER_DAY = 24
    CLEAR_DAILY_MEAN_MAX = 20
    CLOUDY_DAILY_MEAN_MIN = 80
    OPPOSITE_HOUR_BOUNDARY = 50
    MAX_CLOUDY_HOURS_IN_CLEAR_DAY = 3
    ZERO_MONTHLY_CLOUD_COVER_BIAS = (0.0,) * 12
    MONTHLY_CLOUD_COVER_BIASES = {
        # Station minus ERA5 at matching synoptic observations, 1995-2025.
        1: (-2.8, -2.6, -0.8, 1.7, 2.7, 3.4, 3.1, 0.8, 0.6, 1.9, 1.2, 0.0),
        4: (-9.0, -9.4, -7.8, -5.1, 0.3, -0.6, 0.1, -1.4, -4.2, -5.3, -4.3, -6.5),
    }

    def __init__(
        self,
        connection: sqlite3.Connection,
        repository: WeatherRepository,
    ) -> None:
        self.connection = connection
        self.repository = repository

    def get_hourly_weather(
        self,
        city_id: int,
    ) -> list[WeatherHourly]:
        return self.repository.get_hourly_by_city_id(city_id)

    def create_hourly_weather(self, data: list[WeatherHourly]) -> None:
        try:
            self.repository.create_hourly_many(data)
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

    def create_daily_averages(self, data: list[WeatherDaily]) -> None:
        try:
            self.repository.create_daily_averages_many(data)
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

    def calculate_wind_rose(self, city_id: int) -> list[WindRoseSector]:
        distribution = self.repository.get_wind_direction_distribution(city_id)
        by_sector = {
            sector: (sample_count, average_speed)
            for sector, sample_count, average_speed in distribution
        }
        total_samples = sum(sample_count for _, sample_count, _ in distribution)

        return [
            WindRoseSector(
                direction=direction,
                frequency=(
                    round(by_sector.get(index, (0, None))[0] / total_samples * 100, 2)
                    if total_samples > 0
                    else 0.0
                ),
                sample_count=by_sector.get(index, (0, None))[0],
                average_speed=(
                    round(by_sector[index][1], 2)
                    if index in by_sector and by_sector[index][1] is not None
                    else None
                ),
            )
            for index, direction in enumerate(self.WIND_DIRECTIONS)
        ]

    def create_wind_rose(
        self,
        city_id: int,
        sectors: list[WindRoseSector],
    ) -> None:
        try:
            self.repository.replace_wind_rose(city_id, sectors)
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

    def update_daily_apparent_temperatures(
        self,
        city_id: int,
        values_by_day: dict[str, float],
    ) -> None:
        try:
            self.repository.update_daily_apparent_temperatures(city_id, values_by_day)
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise

    def get_monthly_cloud_cover_distribution(self, city_id: int) -> list[dict]:
        monthly_biases = self.MONTHLY_CLOUD_COVER_BIASES.get(
            city_id,
            self.ZERO_MONTHLY_CLOUD_COVER_BIAS,
        )
        distribution = self.repository.get_monthly_cloud_cover_distribution(
            city_id,
            monthly_biases,
            self.CLOUD_COVER_HOURS_PER_DAY,
            self.CLEAR_DAILY_MEAN_MAX,
            self.CLOUDY_DAILY_MEAN_MIN,
            self.OPPOSITE_HOUR_BOUNDARY,
            self.MAX_CLOUDY_HOURS_IN_CLEAR_DAY,
        )

        result = []

        for month, total, clear, partly_cloudy, cloudy in distribution:
            if total == 0:
                continue

            clear_share = round(clear / total * 100, 1)
            partly_cloudy_share = round(partly_cloudy / total * 100, 1)
            cloudy_share = round(100 - clear_share - partly_cloudy_share, 1)

            result.append(
                {
                    "observed_date": f"{month}-15",
                    "clear": clear_share,
                    "partly_cloudy": partly_cloudy_share,
                    "cloudy": cloudy_share,
                    "sample_count": total,
                    "calibrated": city_id in self.MONTHLY_CLOUD_COVER_BIASES,
                }
            )

        return result

    def get_climate_data(self, city_id: int) -> dict[str, list]:
        return {
            "daily": self.repository.get_daily_averages_by_city_id(city_id),
            "wind_rose": self.repository.get_wind_rose_by_city_id(city_id),
            "cloud_cover": self.get_monthly_cloud_cover_distribution(city_id),
        }
