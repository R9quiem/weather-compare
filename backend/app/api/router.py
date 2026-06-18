from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.cities import router as cities_router
from app.api.routes.weather import router as weather_router

router = APIRouter()

router.include_router(health_router)
router.include_router(cities_router)
router.include_router(weather_router)
