from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import router
from app.db.seed import seed_database

import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)


logger = logging.getLogger(__name__)


async def lifespan(app:FastAPI):

    logger.info("Application startup started")

    try:
        logger.info("Database seeding started")

        seed_database()

        logger.info("Database seeding finished")

        logger.info("Application startup finished")

        yield

    except Exception:
        logger.exception("Application startup failed")

        raise

    finally:
        logger.info("Application shutdown started")

        logger.info("Application shutdown finished")

app = FastAPI(
    title="Weather Analysis API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
