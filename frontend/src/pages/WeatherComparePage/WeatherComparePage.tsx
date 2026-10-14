import type { City, WeatherMetric, WindView } from "../../types/weather.ts";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCities } from "../../api/weatherApi.ts";
import { useDailyWeather } from "../../hooks/useDailyWeather.ts";
import CompareCityCard from "./CompareCityCard.tsx";
import CompareDashboard from "./CompareDashboard.tsx";
import CompareOverviewCard from "./CompareOverviewCard.tsx";
import CompareStats from "./CompareStats.tsx";
import { calculateComparisonSummary } from "./compareSummary.ts";
import { getCityName } from "../../utils/localization.ts";

function WeatherComparePage() {
    const { t } = useTranslation();
    const [cities, setCities] = useState<City[]>([]);
    const [firstCityId, setFirstCityId] = useState<number | null>(null);
    const [secondCityId, setSecondCityId] = useState<number | null>(null);
    const [selectedMetric, setSelectedMetric] = useState<WeatherMetric>("temperature");
    const [windView, setWindView] = useState<WindView>("speed");
    const [isCitiesLoading, setIsCitiesLoading] = useState(true);
    const [cityError, setCityError] = useState<string | null>(null);

    useEffect(() => {
        async function loadCities() {
            try {
                setIsCitiesLoading(true);
                setCityError(null);

                const loadedCities = await getCities();

                setCities(loadedCities);
                setFirstCityId(loadedCities[0]?.id ?? null);
                setSecondCityId(loadedCities[1]?.id ?? null);
            } catch (requestError) {
                setCityError(
                    requestError instanceof Error ? requestError.message : String(requestError)
                );
            } finally {
                setIsCitiesLoading(false);
            }
        }

        loadCities();
    }, []);

    const firstWeather = useDailyWeather(firstCityId);
    const secondWeather = useDailyWeather(secondCityId);
    const firstCity = cities.find((city) => String(city.id) === String(firstCityId));
    const secondCity = cities.find((city) => String(city.id) === String(secondCityId));
    const firstCityName = getCityName(t, firstCity, t("compare.cityFallback", { number: 1 }));
    const secondCityName = getCityName(t, secondCity, t("compare.cityFallback", { number: 2 }));
    const error = cityError || firstWeather.error || secondWeather.error;
    const isWeatherLoading = firstWeather.isLoading || secondWeather.isLoading;

    const comparisonSummary = useMemo(
        () =>
            calculateComparisonSummary(
                selectedMetric,
                firstWeather,
                secondWeather,
                firstCity,
                secondCity
            ),
        [selectedMetric, firstWeather, secondWeather, firstCity, secondCity]
    );

    return (
        <CompareDashboard>
            <CompareCityCard
                cities={cities}
                firstCity={firstCity}
                secondCity={secondCity}
                firstCityId={firstCityId}
                secondCityId={secondCityId}
                setFirstCityId={setFirstCityId}
                setSecondCityId={setSecondCityId}
                isLoading={isCitiesLoading}
                error={error}
            />

            <CompareStats summary={comparisonSummary} />

            <CompareOverviewCard
                firstWeather={firstWeather}
                secondWeather={secondWeather}
                firstCityName={firstCityName}
                secondCityName={secondCityName}
                selectedMetric={selectedMetric}
                setSelectedMetric={setSelectedMetric}
                windView={windView}
                setWindView={setWindView}
                isLoading={isWeatherLoading}
                error={error}
            />
        </CompareDashboard>
    );
}

export default WeatherComparePage;
