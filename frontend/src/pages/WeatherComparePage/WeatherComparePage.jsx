import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getCities } from "../../api/weatherApi.jsx";
import { useDailyWeather } from "../../hooks/useDailyWeather.jsx";
import CompareCityCard from "./CompareCityCard.jsx";
import CompareDashboard from "./CompareDashboard.jsx";
import CompareOverviewCard from "./CompareOverviewCard.jsx";
import CompareStats from "./CompareStats.jsx";
import { calculateComparisonSummary } from "./compareSummary.js";
import { getCityName } from "../../utils/localization.js";

function WeatherComparePage() {
    const { t } = useTranslation();
    const [cities, setCities] = useState([]);
    const [firstCityId, setFirstCityId] = useState(null);
    const [secondCityId, setSecondCityId] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState("temperature");
    const [windView, setWindView] = useState("speed");
    const [isCitiesLoading, setIsCitiesLoading] = useState(true);
    const [cityError, setCityError] = useState(null);

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
                setCityError(requestError.message);
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
