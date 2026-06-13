from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class WeatherHourly:
    city_id: int
    observed_at: str
    temperature_2m: float
    precipitation: float
    cloud_cover: float
    relative_humidity_2m: float
    wind_speed_10m: float

@dataclass(frozen=True, slots=True)
class WeatherDaily:
    city_id: int
    observed_date: str
    temperature_2m_mean: float
    temperature_2m_max: float
    temperature_2m_min: float
    precipitation_sum: float
    cloud_cover_mean: float
    relative_humidity_2m_mean: float
    wind_speed_10m_mean: float