import { useEffect, useMemo, useState } from "react";

import { getCities } from "../../api/weatherApi.jsx";
import { useDailyWeather } from "../../hooks/useDailyWeather.jsx";
import CityClimateCard from "./CityClimateCard.jsx";
import ClimateDashboard from "./ClimateDashboard.jsx";
import ClimateOverviewCard from "./ClimateOverviewCard.jsx";
import ClimateStats from "./ClimateStats.jsx";
import { calculateClimateSummary } from "./climateSummary.js";
import MetricInsightCard from "./MetricInsightCard.jsx";
import { addApparentTemperature } from "./metricInsights.js";

function CityWeatherPage() {
    const [cities, setCities] = useState([]);
    const [currentCityId, setCurrentCityId] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState("temperature");
    const [windView, setWindView] = useState("speed");
    const [isCitiesLoading, setIsCitiesLoading] = useState(true);
    const [citiesError, setCitiesError] = useState(null);

    const {
        data: dailyWeather,
        windRose,
        cloudCover,
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

    const currentCity = cities.find((city) => String(city.id) === String(currentCityId));

    const weatherWithApparentTemperature = useMemo(
        () => addApparentTemperature(dailyWeather),
        [dailyWeather]
    );
    const climateSummary = useMemo(
        () => calculateClimateSummary(weatherWithApparentTemperature),
        [weatherWithApparentTemperature]
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

            <MetricInsightCard
                selectedMetric={selectedMetric}
                dailyWeather={weatherWithApparentTemperature}
                windRose={windRose}
                cloudCover={cloudCover}
                windView={windView}
                isLoading={isWeatherLoading}
            />

            <ClimateOverviewCard
                dailyWeather={weatherWithApparentTemperature}
                windRose={windRose}
                cloudCover={cloudCover}
                selectedMetric={selectedMetric}
                setSelectedMetric={setSelectedMetric}
                windView={windView}
                setWindView={setWindView}
            />

            <ClimateStats
                climateSummary={climateSummary}
                cloudCover={cloudCover}
                windRose={windRose}
                selectedMetric={selectedMetric}
                isLoading={isWeatherLoading}
            />
        </ClimateDashboard>
    );
}

export default CityWeatherPage;
