from app.clients.open_meteo_api import load_weather
from app.db.init_db import init_db
from app.db.connection import create_connection
from app.repositories.city_repository import CityRepository
from app.repositories.weather_repository import WeatherRepository
from app.services.weather_service import WeatherService
from app.utils.config import CITIES, START_DATE, END_DATE, HOURLY_VARIABLES
from app.utils.logging import log_time


@log_time
def seed_database() -> None:
    init_db()

    connection = create_connection()

    try:
        city_repository = CityRepository(connection)
        weather_repository = WeatherRepository(connection)
        weather_service = WeatherService(connection, weather_repository)

        for city_data in CITIES:
            city = city_repository.get_by_name_and_country(
                city_data.name,
                city_data.country_code,
            )

            if city is None:
                city = city_repository.create(city_data)
                connection.commit()

            existing_weather = weather_repository.get_hourly_by_city_id(city.id)

            if existing_weather:
                continue

            hourly_weather = load_weather(
                city_id=city.id,
                latitude=city.latitude,
                longitude=city.longitude,
                start_date=START_DATE,
                end_date=END_DATE,
                hourly_variables=HOURLY_VARIABLES,
            )

            weather_service.create_hourly_weather(hourly_weather)

    finally:
        connection.close()