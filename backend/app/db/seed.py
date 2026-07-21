from app.clients.open_meteo_api import load_weather
from app.db.init_db import init_db
from app.db.connection import create_connection
from app.repositories.city_repository import CityRepository
from app.repositories.weather_repository import WeatherRepository
from app.services.weather_analysis_service import (
    aggregate_hourly_weather_by_day,
    calculate_daily_weather_averages,
)
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

            hourly_weather_is_complete = weather_repository.has_complete_hourly_weather(
                city.id
            )

            if not hourly_weather_is_complete:
                hourly_weather = load_weather(
                    city_id=city.id,
                    latitude=city.latitude,
                    longitude=city.longitude,
                    start_date=START_DATE,
                    end_date=END_DATE,
                    hourly_variables=HOURLY_VARIABLES,
                )

                weather_service.create_hourly_weather(hourly_weather)

                if not weather_repository.has_complete_hourly_weather(city.id):
                    raise ValueError(
                        f"Hourly weather is incomplete after seeding city {city.id}"
                    )

            daily_weather_is_complete = weather_repository.has_complete_daily_weather(
                city.id
            )

            if not daily_weather_is_complete:
                hourly_weather = weather_repository.get_hourly_by_city_id(city.id)

                daily_weather = aggregate_hourly_weather_by_day(hourly_weather)

                daily_weather_averages = calculate_daily_weather_averages(daily_weather)

                weather_service.create_daily_averages(
                    list(daily_weather_averages.values())
                )

                if not weather_repository.has_complete_daily_weather(city.id):
                    raise ValueError(
                        f"Daily weather is incomplete after seeding city {city.id}"
                    )

            if not weather_repository.has_complete_wind_rose(city.id):
                wind_rose = weather_service.calculate_wind_rose(city.id)
                weather_service.create_wind_rose(city.id, wind_rose)

                if not weather_repository.has_complete_wind_rose(city.id):
                    raise ValueError(
                        f"Wind rose is incomplete after seeding city {city.id}"
                    )

    finally:
        connection.close()
