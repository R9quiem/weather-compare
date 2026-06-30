import TemperatureChart from "../components/charts/TemperatureChart";
import { useEffect, useState } from "react";
import {getCities, getDailyWeather} from "../api/weatherApi.jsx";

function CityWeatherPage() {
    const [cities, setCities] = useState([]);
    const [currentCityId, setCurrentCityId] = useState(null);
    const [dailyWeather, setDailyWeather] = useState([]);
    const [isCitiesLoading, setIsCitiesLoading] = useState(true);
    const [isWeatherLoading, setIsWeatherLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadCities() {
            try {
                setIsCitiesLoading(true);
                setError(null);

                const loadedCities = await getCities();

                setCities(loadedCities);

                if (loadedCities.length > 0) {
                    setCurrentCityId(loadedCities[0].id)
                }

            } catch (requestError) {
                setError(requestError.message);
            } finally {
                setIsCitiesLoading(false);
            }
        }

        loadCities();
    }, []);

    useEffect(()=> {
        async function loadDailyWeather() {
            try {
                setIsWeatherLoading(true);

                setError(null);

                const loadedDailyWeather = await getDailyWeather(currentCityId);

                setDailyWeather(Object.values(loadedDailyWeather));
            } catch (requestError) {
                setError(requestError.message);
            } finally {
                setIsWeatherLoading(false)
            }
        }

        if (currentCityId !== null) {
          loadDailyWeather()
        }
    },[currentCityId])

    return (
        <div >
            <h1>City weather</h1>
            {isCitiesLoading && <p>Загрузка городов...</p>}

            {error && <p>Ошибка: {error}</p>}

            {!isCitiesLoading && !error && (
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
