import type { City, WeatherMetric, WindView } from "../../types/weather.ts";
import { useEffect, useMemo, useState } from "react";
import { getCities } from "../../api/weatherApi.ts";
import { useDailyWeather } from "../../hooks/useDailyWeather.ts";
import CityClimateCard from "./CityClimateCard.tsx";
import ClimateDashboard from "./ClimateDashboard.tsx";
import ClimateOverviewCard from "./ClimateOverviewCard.tsx";
import ClimateStats from "./ClimateStats.tsx";
import { calculateClimateSummary } from "./climateSummary.ts";
import MetricInsightCard from "./MetricInsightCard.tsx";
import { addApparentTemperature } from "./metricInsights.ts";

function CityWeatherPage() {
    const [cities, setCities] = useState<City[]>([]);
    const [currentCityId, setCurrentCityId] = useState<number | null>(null);
    const [selectedMetric, setSelectedMetric] = useState<WeatherMetric>("temperature");
    const [windView, setWindView] = useState<WindView>("speed");
    const [isCitiesLoading, setIsCitiesLoading] = useState(true);
    const [citiesError, setCitiesError] = useState<string | null>(null);

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
                setCitiesError(
                    requestError instanceof Error ? requestError.message : String(requestError)
                );
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
