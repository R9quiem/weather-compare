import os
from dataclasses import dataclass
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


settings = Settings(
    database_path=_database_path(),
    cors_origins=_cors_origins(),
    seed_database_on_startup=_is_enabled("SEED_DATABASE_ON_STARTUP", True),
)
