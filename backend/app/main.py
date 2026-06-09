from app.db.connection import create_connection
from app.db.init_db import init_db
from app.models import CreateCity, City
from app.models.weather import WeatherHourly
from app.repositories.city_repository import CityRepository
from app.repositories.weather_repository import WeatherRepository
from app.services.city_service import CityService
from app.services.weather_analysis_service import aggregate_hourly_weather_by_day, get_historical_weather_averages
from app.services.weather_service import WeatherService
from app.utils.config import CITIES, START_DATE, END_DATE, HOURLY_VARIABLES
from backend.app.clients.open_meteo_api import load_weather

def main():

    init_db()

    connection = create_connection()

    try:
        city_repository = CityRepository(connection)
        city_service = CityService(connection, city_repository)

        weather_repository = WeatherRepository(connection)
        weather_service = WeatherService(connection, weather_repository)

        #for city in CITIES:
        #    city_service.create_city(city)

        cities: list[City] = city_service.get_cities()

        for city in cities:
            """
            hourly_weather: list[WeatherHourly] = load_weather(
                city_id=city.id,
                latitude=city.latitude,
                longitude=city.longitude,
                start_date=START_DATE,
                end_date=END_DATE,
                hourly_variables=HOURLY_VARIABLES,
            )

            
            weather_service.create_hourly_weather(
                hourly_weather
            )
            """

            hourly_weather: list[WeatherHourly] = weather_service.get_hourly_weather(city.id)

            daily_weather = aggregate_hourly_weather_by_day(
                hourly_weather
            )

            historical_averages = (
                get_historical_weather_averages(
                    daily_weather
                )
            )

            print(f"\nГород: {city.name}")
            print(historical_averages)

    finally:
        connection.close()

if __name__ == "__main__":
    main()