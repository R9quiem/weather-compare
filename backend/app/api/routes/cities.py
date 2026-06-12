from fastapi import APIRouter

from app.db.connection import create_connection
from app.repositories.city_repository import CityRepository
from app.services.city_service import CityService

router = APIRouter(prefix="/cities", tags=["cities"])

@router.get("")
def get_cities():
    connection = create_connection()

    try:
        city_repository = CityRepository(connection)
        city_service = CityService(connection, city_repository)

        return  city_service.get_cities()
    finally:
        connection.close()