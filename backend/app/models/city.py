from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class City:
    id: int
    name: str
    country_code: str
    latitude: float
    longitude: float


@dataclass(frozen=True, slots=True)
class CreateCity:
    name: str
    country_code: str
    latitude: float
    longitude: float