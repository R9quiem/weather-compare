import TemperatureChart from "../components/charts/TemperatureChart";
import { useEffect, useState } from "react";
import { getCities } from "../api.jsx";

function CityWeatherPage() {
    const [cities, setCities] = useState([]);
    const [dailyWeather, setDailyWeather] = useState([])
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadCities() {
            try {
                setIsLoading(true);
                setError(null);

                const loadedCities = await getCities();

                setCities(loadedCities);
            } catch (requestError) {
                setError(requestError.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadCities();
    }, []);

    return (
        <div>
            <h1>City weather</h1>
            {isLoading && <p>Загрузка городов...</p>}

            {error && <p>Ошибка: {error}</p>}

            {!isLoading && !error && (
                <ul>
                    {cities.map((city) => (
                        <li key={city.id}>
                            {city.name}, {city.country_code}
                        </li>
                    ))}
                </ul>
            )}
            <TemperatureChart />
        </div>
    );
}
export default CityWeatherPage;
