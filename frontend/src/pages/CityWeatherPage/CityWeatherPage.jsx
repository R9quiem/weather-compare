import {useEffect, useMemo, useState} from "react";

import {getCities} from "../../api/weatherApi.jsx";
import {useDailyWeather} from "../../hooks/useDailyWeather.jsx";
import CityClimateCard from "./CityClimateCard.jsx";
import ClimateDashboard from "./ClimateDashboard.jsx";
import ClimateOverviewCard from "./ClimateOverviewCard.jsx";
import ClimateStats from "./ClimateStats.jsx";
import {calculateClimateSummary} from "./climateSummary.js";

function CityWeatherPage() {
    const [cities, setCities] = useState([]);
    const [currentCityId, setCurrentCityId] = useState(null);
    const [isCitiesLoading, setIsCitiesLoading] = useState(true);
    const [citiesError, setCitiesError] = useState(null);

    const {
        data: dailyWeather,
        windRose,
        isLoading: isWeatherLoading,
        error: weatherError,
    } = useDailyWeather(currentCityId);

    useEffect(() => {
        async function loadCities() {
            try {
                setIsCitiesLoading(true);
                setCitiesError(null);

                const loadedCities = await getCities();

                setCities(loadedCities);

                if (loadedCities.length > 0) {
                    setCurrentCityId(loadedCities[0].id);
                }
            } catch (requestError) {
                setCitiesError(requestError.message);
            } finally {
                setIsCitiesLoading(false);
            }
        }

        loadCities();
    }, []);

    const currentCity = cities.find(
        (city) => String(city.id) === String(currentCityId),
    );

    const climateSummary = useMemo(
        () => calculateClimateSummary(dailyWeather),
        [dailyWeather],
    );

    const error = citiesError || weatherError;

    return (
        <ClimateDashboard>
            <CityClimateCard
                cities={cities}
                currentCity={currentCity}
                currentCityId={currentCityId}
                setCurrentCityId={setCurrentCityId}
                isCitiesLoading={isCitiesLoading}
                error={error}
            />

            <ClimateOverviewCard
                dailyWeather={dailyWeather}
                windRose={windRose}
            />

            <ClimateStats
                climateSummary={climateSummary}
                isLoading={isWeatherLoading}
            />
        </ClimateDashboard>
    );
}

export default CityWeatherPage;
