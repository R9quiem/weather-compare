import TemperatureChart from "../components/charts/TemperatureChart";
import { useEffect, useState } from "react";
import {getCities, getDailyWeather} from "../api.jsx";

function CityWeatherPage() {
    const [cities, setCities] = useState([]);
    const [currentCityId, setCurrentCityId] = useState(null);
    const [dailyWeather, setDailyWeather] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadCities() {
            try {
                setIsLoading(true);
                setError(null);

                const loadedCities = await getCities();

                setCities(loadedCities);

                if (loadedCities.length > 0) {
                    setCurrentCityId(loadedCities[0].id)
                }

            } catch (requestError) {
                setError(requestError.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadCities();
    }, []);

    useEffect(()=> {
        async function loadDailyWeather() {
            try {
                setIsLoading(true);

                setError(null);

                const loadedDailyWeather = await getDailyWeather(currentCityId);

                setDailyWeather(Object.values(loadedDailyWeather));
            } catch (requestError) {
                setError(requestError.message);
            } finally {
                setIsLoading(false)
            }
        }

        if (currentCityId !== null) {
          loadDailyWeather()
        }
    },[currentCityId])

    return (
        <div>
            <h1>City weather</h1>
            {isLoading && <p>Загрузка городов...</p>}

            {error && <p>Ошибка: {error}</p>}

            {!isLoading && !error && (
                <ul>
                  {cities.map((city) => (
                    <li key={city.id}>
                      <label>
                        <input
                          type="radio"
                          name="city"
                          value={city.id}
                          checked={currentCityId === city.id}
                          onChange={() => setCurrentCityId(city.id)}
                        />
                        {city.name}, {city.country_code}
                      </label>
                    </li>
                  ))}
                </ul>
            )}
            <TemperatureChart data={dailyWeather}/>
        </div>
    );
}
export default CityWeatherPage;
