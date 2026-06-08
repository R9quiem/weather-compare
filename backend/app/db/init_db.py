from app.db.connection import create_connection


CREATE_CITIES_TABLE = """
CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    country_code TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,

    UNIQUE(name, country_code),

    CHECK(latitude >= -90 AND latitude <= 90),
    CHECK(longitude >= -180 AND longitude <= 180)
)
"""


def init_db() -> None:
    connection = create_connection()    

    try:
        connection.execute(CREATE_CITIES_TABLE)
        connection.commit()
    finally:
        connection.close()