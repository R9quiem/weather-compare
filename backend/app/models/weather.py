from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class WeatherHourly:
    city_id: int
    observed_at: str
    temperature_2m: float | None
    precipitation: float | None
    cloud_cover: float | None
    sunshine_duration: float | None
    relative_humidity_2m: float | None
    wind_speed_10m: float | None
    wind_direction_10m: float | None = None
    wind_gusts_10m: float | None = None


@dataclass(frozen=True, slots=True)
class WeatherDaily:
    city_id: int
    observed_date: str
    temperature_2m_mean: float | None
    temperature_2m_max: float | None
    temperature_2m_min: float | None
    precipitation_sum: float | None
    cloud_cover_mean: float | None
    sunshine_duration_sum: float | None
    relative_humidity_2m_mean: float | None
    wind_speed_10m_mean: float | None
    wind_direction_10m_dominant: float | None = None
    wind_gusts_10m_max: float | None = None


@dataclass(frozen=True, slots=True)
class WindRoseSector:
    direction: str
    frequency: float
    sample_count: int
    average_speed: float | None
