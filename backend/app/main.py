from config import CITIES, START_DATE, END_DATE, HOURLY_VARIABLES
from backend.app.clients.open_meteo_api import load_weather

def main():
    all_rows = []

    for city_name, city_data in CITIES.items():
        city_rows = load_weather(
            city_name=city_name,
            latitude=city_data["latitude"],
            longitude=city_data["longitude"],
            start_date=START_DATE,
            end_date=END_DATE,
            hourly_variables=HOURLY_VARIABLES,
        )

        all_rows.append(city_rows)

    print(all_rows)

if __name__ == "__main__":
    main()