from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class City:
    id: int
    slug: str
    name: str
    country_code: str
    latitude: float
    longitude: float


@dataclass(frozen=True, slots=True)
class CreateCity:
    slug: str
    name: str
    country_code: str
    latitude: float
    longitude: float
