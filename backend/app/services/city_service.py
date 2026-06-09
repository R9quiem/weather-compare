import sqlite3

from app.models import City, CreateCity
from app.repositories.city_repository import CityRepository


class CityService:
    def __init__(self, connection: sqlite3.Connection, repository: CityRepository):
        self.connection = connection
        self.repository = repository
    def get_cities(self) -> list[City]:
        return self.repository.get_all()

    def get_city_by_id(self, city_id: int) -> City | None:
        return self.repository.get_by_id(city_id)


    def create_city(self, city: CreateCity) -> City:
        try:
            city = self.repository.create(city)
            self.connection.commit()

            return city
        except Exception:
            self.connection.rollback()
            raise
