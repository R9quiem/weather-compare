import unittest
from unittest.mock import Mock, patch

from requests import ConnectTimeout

from app.clients.open_meteo_api import (
    REQUEST_TIMEOUT,
    get_retry_delay,
    load_weather,
    request_with_retry,
)


class OpenMeteoApiTest(unittest.TestCase):
    @patch("app.clients.open_meteo_api.time.sleep")
    @patch("app.clients.open_meteo_api.requests.get")
    def test_request_retries_after_connection_timeout(self, get_mock, sleep_mock):
        response = Mock(status_code=200)
        get_mock.side_effect = [ConnectTimeout("timed out"), response]

        result = request_with_retry("https://example.test", {}, max_retries=2)

        self.assertIs(result, response)
        self.assertEqual(get_mock.call_count, 2)
        get_mock.assert_called_with(
            "https://example.test",
            params={},
            timeout=REQUEST_TIMEOUT,
        )
        sleep_mock.assert_called_once_with(2)

    @patch("app.clients.open_meteo_api.time.sleep")
    @patch("app.clients.open_meteo_api.requests.get")
    def test_request_raises_last_connection_error(self, get_mock, sleep_mock):
        get_mock.side_effect = ConnectTimeout("timed out")

        with self.assertRaises(ConnectTimeout):
            request_with_retry("https://example.test", {}, max_retries=3)

        self.assertEqual(get_mock.call_count, 3)
        self.assertEqual(sleep_mock.call_args_list[0].args, (2,))
        self.assertEqual(sleep_mock.call_args_list[1].args, (4,))

    def test_daily_limit_waits_until_next_utc_day(self):
        response = Mock()
        response.headers = {}
        response.json.return_value = {
            "reason": "Daily API request limit exceeded. Please try again tomorrow."
        }

        delay = get_retry_delay(response, attempt=0)

        self.assertGreater(delay, 5 * 60)
        self.assertLessEqual(delay, 24 * 60 * 60 + 5 * 60)

    def test_hourly_limit_waits_one_hour(self):
        response = Mock()
        response.headers = {}
        response.json.return_value = {"reason": "Hourly API request limit exceeded."}

        delay = get_retry_delay(response, attempt=0)

        self.assertGreaterEqual(delay, 30)
        self.assertLessEqual(delay, 60 * 60 + 30)

    @patch("app.clients.open_meteo_api.request_with_retry")
    def test_load_weather_reads_all_variables_from_era5(self, request_mock):
        response = Mock()
        response.json.return_value = {
            "hourly": {
                "time": ["2025-01-01T00:00"],
                "temperature_2m": [1.0],
                "precipitation": [2.0],
                "cloud_cover": [3.0],
                "sunshine_duration": [1800.0],
                "relative_humidity_2m": [4.0],
                "wind_speed_10m": [5.0],
                "wind_direction_10m": [350.0],
                "wind_gusts_10m": [7.0],
            }
        }
        request_mock.return_value = response

        result = load_weather(
            city_id=1,
            latitude=55.75,
            longitude=37.61,
            start_date="2025-01-01",
            end_date="2025-01-01",
            hourly_variables=[
                "temperature_2m",
                "precipitation",
                "cloud_cover",
                "sunshine_duration",
                "relative_humidity_2m",
                "wind_speed_10m",
                "wind_direction_10m",
                "wind_gusts_10m",
            ],
        )

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].temperature_2m, 1.0)
        self.assertEqual(result[0].wind_speed_10m, 5.0)
        self.assertEqual(result[0].wind_direction_10m, 350.0)
        self.assertEqual(result[0].wind_gusts_10m, 7.0)
        self.assertEqual(request_mock.call_args.args[1]["models"], "era5")
        self.assertEqual(request_mock.call_count, 1)

    @patch("app.clients.open_meteo_api.request_with_retry")
    def test_load_weather_rejects_null_values(self, request_mock):
        response = Mock()
        response.json.return_value = {
            "hourly": {
                "time": ["2025-01-01T00:00"],
                "temperature_2m": [None],
                "relative_humidity_2m": [70.0],
            }
        }
        request_mock.return_value = response

        with self.assertRaisesRegex(ValueError, "null values for temperature_2m"):
            load_weather(
                city_id=1,
                latitude=55.75,
                longitude=37.61,
                start_date="2025-01-01",
                end_date="2025-01-01",
                hourly_variables=["temperature_2m", "relative_humidity_2m"],
            )


if __name__ == "__main__":
    unittest.main()
