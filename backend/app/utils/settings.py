import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[3]

load_dotenv(PROJECT_ROOT / ".env")


def _database_path() -> Path:
    path = Path(os.getenv("DATABASE_PATH", "backend/data/app.db")).expanduser()
    return path if path.is_absolute() else PROJECT_ROOT / path


def _cors_origins() -> tuple[str, ...]:
    origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )
    return tuple(origin.strip() for origin in origins.split(",") if origin.strip())


def _is_enabled(name: str, default: bool) -> bool:
    fallback = "true" if default else "false"
    return os.getenv(name, fallback).strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True, slots=True)
class Settings:
    database_path: Path
    cors_origins: tuple[str, ...]
    seed_database_on_startup: bool
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "weather"
    db_user: str = "weather_app"
    db_password: str = field(default="", repr=False)


settings = Settings(
    db_host=os.getenv("DB_HOST", "localhost"),
    db_port=int(os.getenv("DB_PORT", "5432")),
    db_name=os.getenv("DB_NAME", "weather"),
    db_user=os.getenv("DB_USER", "weather_app"),
    db_password=os.getenv("DB_PASSWORD", ""),
    database_path=_database_path(),
    cors_origins=_cors_origins(),
    seed_database_on_startup=_is_enabled("SEED_DATABASE_ON_STARTUP", True),
)
