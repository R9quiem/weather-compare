import TemperatureChart from "../components/charts/TemperatureChart";
import { useEffect, useState } from "react";
import {getCities, getDailyWeather} from "../api/weatherApi.jsx";
import {useDailyWeather} from "../hooks/useDailyWeather.jsx";

function CityWeatherPage() {
    const [cities, setCities] = useState([]);
    const [currentCityId, setCurrentCityId] = useState(null);
    const [isCitiesLoading, setIsCitiesLoading] = useState(true);
    const [citiesError, setCitiesError] = useState(null);
    const {
        data: dailyWeather,
        isLoading: isWeatherLoading,
        error: weatherError,
    } = useDailyWeather(currentCityId)

    const error = citiesError || weatherError;

    useEffect(()=> {
        async function loadCities() {
            try {
                setIsCitiesLoading(true);

                setCitiesError(null);

                const loadedCities = await getCities();

                setCities(loadedCities);

                if (loadedCities.length > 0) {
                    setCurrentCityId(loadedCities[0].id)
                }

            } catch (requestError) {
                setCitiesError(requestError.message);
            } finally {
                setIsCitiesLoading(false)
            }
        }

        
            loadCities()

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
