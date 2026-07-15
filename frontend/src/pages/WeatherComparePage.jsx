import {useEffect, useState} from "react";
import {getCities} from "../api/weatherApi.jsx";
import {useDailyWeather} from "../hooks/useDailyWeather.jsx";
import CitySelect from "../components/CitySelect/CitySelect.jsx";
import CompareTemperatureChart from "../components/charts/CompareTemperatureChart.jsx";

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

    const firstCityName = cities.find(
        (city) => String(city.id) === String(firstCityId)
    )?.name ?? "Первый город";

    const secondCityName = cities.find(
        (city) => String(city.id) === String(secondCityId)
    )?.name ?? "Второй город";

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
            <CompareTemperatureChart
                firstCityWeather={firstWeather.data}
                secondCityWeather={secondWeather.data}
                firstCityName={firstCityName}
                secondCityName={secondCityName}
            />
        </div>
    );
}

export default CityWeatherPage;
