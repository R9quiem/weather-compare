import psycopg
from psycopg.rows import dict_row

from app.utils.settings import settings


def create_connection() -> psycopg.Connection:
    if not settings.db_password:
        raise ValueError("Set DB_PASSWORD in the project root .env or environment")

    return psycopg.connect(
        host=settings.db_host,
        port=settings.db_port,
        dbname=settings.db_name,
        user=settings.db_user,
        password=settings.db_password,
        connect_timeout=10,
        row_factory=dict_row,
    )
