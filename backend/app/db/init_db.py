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

CREATE_HOURLY_WEATHER_TABLE = """
CREATE TABLE IF NOT EXISTS hourly_weather (
    city_id INTEGER NOT NULL,
    observed_at TEXT NOT NULL,
    
    temperature_2m REAL,
    precipitation REAL,
    cloud_cover REAL,
    relative_humidity_2m REAL,
    wind_speed_10m REAL,

    PRIMARY KEY (city_id, observed_at),
    
    FOREIGN KEY(city_id)
        REFERENCES cities(id)
        ON DELETE CASCADE
)
"""

CREATE_DAILY_AVERAGES_WEATHER_TABLE = """
CREATE TABLE IF NOT EXISTS daily_averages_weather (
    city_id INTEGER NOT NULL,
    observed_date TEXT NOT NULL,

    temperature_2m_mean REAL,
    temperature_2m_max REAL,
    temperature_2m_min REAL,
    precipitation_sum REAL,
    cloud_cover_mean REAL,
    relative_humidity_2m_mean REAL,
    wind_speed_10m_mean REAL,

    PRIMARY KEY (city_id, observed_date),

    FOREIGN KEY(city_id)
        REFERENCES cities(id)
        ON DELETE CASCADE
)
"""

def init_db() -> None:
    connection = create_connection()

    try:
        connection.execute(CREATE_CITIES_TABLE)
        connection.execute(CREATE_HOURLY_WEATHER_TABLE)
        connection.execute(CREATE_DAILY_AVERAGES_WEATHER_TABLE)
        connection.commit()
    finally:
        connection.close()
