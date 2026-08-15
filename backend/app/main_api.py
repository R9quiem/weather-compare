import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import router
from app.db.init_db import init_db
from app.db.seed import seed_database
from app.utils.settings import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)


logger = logging.getLogger(__name__)


async def lifespan(app: FastAPI):

    logger.info("Application startup started")

    try:
        init_db()

        if settings.seed_database_on_startup:
            logger.info("Database seeding started")

            seed_database()

            logger.info("Database seeding finished")
        else:
            logger.info("Database seeding is disabled")

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
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
