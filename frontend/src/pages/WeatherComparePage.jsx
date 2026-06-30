import TemperatureChart from "../components/charts/TemperatureChart";
import { useEffect, useState } from "react";
import {getCities, getDailyWeather} from "../api/weatherApi.jsx";
import {useDailyWeather} from "../hooks/useDailyWeather.jsx";

function CityWeatherPage() {
    const [cities, setCities] = useState([]);
    const [firstCityId, setFirstCityId] = useState(null);
    const [secondCityId, setSecondCityId] = useState(null);
    const [isCitiesLoading, setIsCitiesLoading] = useState(true);
    const [cityError, setCityError] = useState(null);

    useEffect(() => {
        async function loadCities() {
            try {
                setIsCitiesLoading(true);
                setCityError(null);

                const loadedCities = await getCities();

                setCities(loadedCities);

            } catch (requestError) {
                setCityError(requestError.message);
            } finally {
                setIsCitiesLoading(false);
            }
        }

        loadCities();
    }, []);

    const firstWeather = useDailyWeather(firstCityId);
    const secondWeather = useDailyWeather(secondCityId);

    const error = cityError

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
                          name="firstCity"
                          value={city.id}
                          checked={firstCityId === city.id}
                          onChange={() => setFirstCityId(city.id)}
                          disabled={city.id===secondCityId}
                        />
                        {city.name}, {city.country_code}
                      </label>
                    </li>
                  ))}
                </ul>

            )}
            {!isCitiesLoading && !error && (
                <ul>
                  {cities.map((city) => (
                    <li key={city.id}>
                      <label>
                        <input
                          type="radio"
                          name="secondCity"
                          value={city.id}
                          checked={secondCityId === city.id}
                          onChange={() => setSecondCityId(city.id)}
                          disabled={firstCityId===city.id}
                        />
                        {city.name}, {city.country_code}
                      </label>
                    </li>
                  ))}
                </ul>

            )}
            <TemperatureChart data={firstWeather.data}/>
        </div>
    );
}
export default CityWeatherPage;
