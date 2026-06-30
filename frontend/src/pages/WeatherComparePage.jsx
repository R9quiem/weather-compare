import TemperatureChart from "../components/charts/TemperatureChart";
import {useEffect, useState} from "react";
import {getCities} from "../api/weatherApi.jsx";
import {useDailyWeather} from "../hooks/useDailyWeather.jsx";
import CitySelect from "../components/CitySelect/CitySelect.jsx";

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
        <div>
            <h1>City weather</h1>
            {isCitiesLoading && <p>Загрузка городов...</p>}

            {error && <p>Ошибка: {error}</p>}

            <div>
                {!isCitiesLoading && !error && (
                    <CitySelect
                        cities={cities}
                        selectedCityId={firstCityId}
                        setSelectedCityId={setFirstCityId}
                        placeholder="First city"
                        disabledCityId={secondCityId}
                    />
                )}
                {!isCitiesLoading && !error && (
                    <CitySelect
                        cities={cities}
                        selectedCityId={secondCityId}
                        setSelectedCityId={setSecondCityId}
                        placeholder="Second city"
                        disabledCityId={firstCityId}
                    />
                )}
            </div>
            <TemperatureChart data={firstWeather.data}/>
        </div>
    );
}

export default CityWeatherPage;
