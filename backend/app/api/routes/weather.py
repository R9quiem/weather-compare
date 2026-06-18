from fastapi import APIRouter

from app.db.connection import create_connection
from app.repositories.weather_repository import WeatherRepository
from app.services.weather_service import WeatherService
from app.services.weather_analysis_service import (
    aggregate_hourly_weather_by_day,
    calculate_daily_weather_averages,
)

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("/hourly/{city_id}")
def get_hourly_weather_for_city(city_id: int):
    connection = create_connection()

    try:
        weather_repository = WeatherRepository(connection)

        weather_service = WeatherService(connection, weather_repository)

        return weather_service.get_hourly_weather(city_id)

    finally:
        connection.close()


@router.get("/daily_averages/{city_id}")
def get_daily_weather_averages_for_city(city_id: int):
    connection = create_connection()

    try:
        weather_repository = WeatherRepository(connection)

        weather_service = WeatherService(connection, weather_repository)

        hourly_weather = weather_service.get_hourly_weather(city_id)

        daily_weather = aggregate_hourly_weather_by_day(hourly_weather)

        daily_averages = calculate_daily_weather_averages(daily_weather)

        return daily_averages

    finally:
        connection.close()
