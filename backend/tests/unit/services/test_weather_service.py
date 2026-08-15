from unittest.mock import Mock

import pytest

from app.services.weather_service import WeatherService


def test_calculates_wind_rose():
    connection = Mock()
    repository = Mock()
    repository.get_wind_direction_distribution.return_value = [
        (0, 2, 10.0),
        (2, 1, 20.0),
    ]
    service = WeatherService(connection, repository)

    result = service.calculate_wind_rose(city_id=1)

    assert len(result) == 8

    north = result[0]
    east = result[2]

    assert north.direction == "N"
    assert north.frequency == 66.67
    assert north.sample_count == 2
    assert north.average_speed == 10.0

    assert east.direction == "E"
    assert east.frequency == 33.33
    assert east.sample_count == 1
    assert east.average_speed == 20.0


def test_returns_empty_wind_rose_when_observations_are_missing():
    connection = Mock()
    repository = Mock()
    repository.get_wind_direction_distribution.return_value = []
    service = WeatherService(connection, repository)

    result = service.calculate_wind_rose(city_id=1)

    assert len(result) == 8
    assert all(sector.frequency == 0.0 for sector in result)
    assert all(sector.sample_count == 0 for sector in result)
    assert all(sector.average_speed is None for sector in result)


def test_commits_daily_weather():
    connection = Mock()
    repository = Mock()
    service = WeatherService(connection, repository)

    service.create_daily_averages([])

    repository.create_daily_averages_many.assert_called_once_with([])
    connection.commit.assert_called_once()
    connection.rollback.assert_not_called()


def test_rolls_back_when_daily_weather_cannot_be_saved():
    connection = Mock()
    repository = Mock()
    repository.create_daily_averages_many.side_effect = RuntimeError("Database error")
    service = WeatherService(connection, repository)

    with pytest.raises(RuntimeError, match="Database error"):
        service.create_daily_averages([])

    connection.rollback.assert_called_once()
    connection.commit.assert_not_called()
