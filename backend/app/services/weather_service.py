import sqlite3

from app.models.weather import WeatherDaily, WeatherHourly, WindRoseSector
from app.repositories.weather_repository import WeatherRepository


class WeatherService:
    WIND_DIRECTIONS = ("N", "NE", "E", "SE", "S", "SW", "W", "NW")
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

    def get_climate_data(self, city_id: int) -> dict[str, list]:
        return {
            "daily": self.repository.get_daily_averages_by_city_id(city_id),
            "wind_rose": self.repository.get_wind_rose_by_city_id(city_id),
        }
