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
    sunshine_duration REAL,
    relative_humidity_2m REAL,
    wind_speed_10m REAL,
    wind_direction_10m REAL,
    wind_gusts_10m REAL,

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
    sunshine_duration_sum REAL,
    relative_humidity_2m_mean REAL,
    wind_speed_10m_mean REAL,
    wind_direction_10m_dominant REAL,
    wind_gusts_10m_max REAL,

    PRIMARY KEY (city_id, observed_date),

    FOREIGN KEY(city_id)
        REFERENCES cities(id)
        ON DELETE CASCADE
)
"""

CREATE_WIND_ROSE_TABLE = """
CREATE TABLE IF NOT EXISTS wind_rose (
    city_id INTEGER NOT NULL,
    direction TEXT NOT NULL,
    frequency REAL NOT NULL,
    sample_count INTEGER NOT NULL,
    average_speed REAL,

    PRIMARY KEY (city_id, direction),

    FOREIGN KEY(city_id)
        REFERENCES cities(id)
        ON DELETE CASCADE
)
"""

WEATHER_COLUMN_MIGRATIONS = {
    "hourly_weather": {
        "sunshine_duration": "REAL",
        "wind_direction_10m": "REAL",
        "wind_gusts_10m": "REAL",
    },
    "daily_averages_weather": {
        "sunshine_duration_sum": "REAL",
        "wind_direction_10m_dominant": "REAL",
        "wind_gusts_10m_max": "REAL",
    },
}


def add_missing_weather_columns(connection) -> None:
    for table_name, columns in WEATHER_COLUMN_MIGRATIONS.items():
        existing_columns = {
            row["name"]
            for row in connection.execute(f"PRAGMA table_info({table_name})")
        }

        for column_name, column_type in columns.items():
            if column_name not in existing_columns:
                connection.execute(
                    f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"
                )


def init_db() -> None:
    connection = create_connection()

    try:
        connection.execute(CREATE_CITIES_TABLE)
        connection.execute(CREATE_HOURLY_WEATHER_TABLE)
        connection.execute(CREATE_DAILY_AVERAGES_WEATHER_TABLE)
        connection.execute(CREATE_WIND_ROSE_TABLE)
        add_missing_weather_columns(connection)
        connection.commit()
    finally:
        connection.close()
