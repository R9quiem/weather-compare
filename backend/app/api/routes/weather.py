from fastapi import APIRouter

from app.db.connection import create_connection
from app.repositories.weather_repository import WeatherRepository
from app.services.weather_service import WeatherService

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