import sqlite3

from app.models.weather import WeatherHourly
from app.repositories.weather_repository import WeatherRepository


class WeatherService:
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
