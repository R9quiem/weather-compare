from app.db.connection import create_connection
from app.db.init_db import init_db
from app.models import CreateCity
from app.repositories.city_repository import CityRepository
from app.services import city_service
from app.services.city_service import CityService
from app.utils.config import CITIES, START_DATE, END_DATE, HOURLY_VARIABLES
from backend.app.clients.open_meteo_api import load_weather

def main():

    init_db()

    connection = create_connection()

    try:
        repository = CityRepository(connection)
        city_service = CityService(connection, repository)

        for city in CITIES:
            city_service.create_city(city)

        print(city_service.get_cities());
    finally:
        connection.close()



    """
    all_rows = []

    for city_name, city_data in CITIES.items():
        city_rows = load_weather(
            city_name=city_name,
            latitude=city_data["latitude"],
            longitude=city_data["longitude"],
            start_date=START_DATE,
            end_date=END_DATE,
            hourly_variables=HOURLY_VARIABLES,
        )

        all_rows.append(city_rows)

    print(all_rows)
    """
if __name__ == "__main__":
    main()