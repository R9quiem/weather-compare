import TemperatureChart from "../../components/charts/TemperatureChart.jsx";
import {useEffect, useState} from "react";
import {getCities} from "../../api/weatherApi.jsx";
import {useDailyWeather} from "../../hooks/useDailyWeather.jsx";
import CitySelect from "../../components/CitySelect/CitySelect.jsx";
import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";
import DashboardGrid from "../../components/DashboardGrid/DashboardGrid.jsx";

import styles from "./CityWeatherPage.module.css"

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

    useEffect(() => {
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
    }, [])

    return (
        <div className={styles.page}>
            <DashboardGrid>
                <DashboardCard className={styles.overview} variant="secondary">
                    <DashboardGrid className={styles.overviewGrid}>
                        {/*{isCitiesLoading && <p>Загрузка городов...</p>}*/}

                        {/*{error && <p>Ошибка: {error}</p>}*/}

                        <DashboardCard className={styles.select}>
                            <div>Выбор города</div>
                            {!isCitiesLoading && !error && (

                                <CitySelect
                                    cities={cities}
                                    selectedCityId={currentCityId}
                                    setSelectedCityId={setCurrentCityId}
                                    placeholder="City"
                                />
                            )}
                        </DashboardCard>
                        <DashboardCard className={styles.chart}>
                            <div>Температура</div>
                            <TemperatureChart data={dailyWeather}/>
                        </DashboardCard>
                    </DashboardGrid>
                </DashboardCard>
            </DashboardGrid>
        </div>
    );
}

export default CityWeatherPage;
