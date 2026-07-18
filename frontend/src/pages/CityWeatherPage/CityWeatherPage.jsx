import TemperatureChart from "../../components/charts/TemperatureChart.jsx";
import {useEffect, useMemo, useState} from "react";
import {getCities} from "../../api/weatherApi.jsx";
import {useDailyWeather} from "../../hooks/useDailyWeather.jsx";
import CitySelect from "../../components/CitySelect/CitySelect.jsx";
import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";
import DashboardGrid from "../../components/DashboardGrid/DashboardGrid.jsx";

import styles from "./CityWeatherPage.module.css"

const WEATHER_METRICS = [{
    key: "temperature", label: "Температура",
}, {
    key: "precipitation", label: "Осадки",
}, {
    key: "humidity", label: "Влажность",
}, {
    key: "wind", label: "Ветер",
}, {
    key: "cloud", label: "Облачность",
},];

const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

function formatTemperature(value) {
  if (value == null) return "—";

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}°`;
}

function CityWeatherPage() {
    const [cities, setCities] = useState([]);
    const [currentCityId, setCurrentCityId] = useState(null);
    const [isCitiesLoading, setIsCitiesLoading] = useState(true);
    const [citiesError, setCitiesError] = useState(null);
    const {
        data: dailyWeather, isLoading: isWeatherLoading, error: weatherError,
    } = useDailyWeather(currentCityId)
    const [selectedMetric, setSelectedMetric] = useState("temperature");
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

    const currentCity = cities.find((city) => String(city.id) === String(currentCityId),);

    const climateSummary = useMemo(() => {
        if (!dailyWeather.length) {
            return null;
        }

        const annualMean = dailyWeather.reduce((sum, day) => sum + day.temperature_2m_mean, 0,) / dailyWeather.length;

        const monthlyPrecipitation = Array(12).fill(0);

        dailyWeather.forEach((day) => {
            const monthIndex = Number(day.observed_date.slice(0, 2)) - 1;

            monthlyPrecipitation[monthIndex] += day.precipitation_sum ?? 0;
        });

        const wettestMonthIndex = monthlyPrecipitation.indexOf(Math.max(...monthlyPrecipitation),);

        return {
            annualMean,
            wettestMonth: MONTH_NAMES[wettestMonthIndex],
            wettestMonthPrecipitation: monthlyPrecipitation[wettestMonthIndex],
        };
    }, [dailyWeather]);

    return (<div className={styles.page}>
        <DashboardGrid>
            <DashboardCard className={styles.overview} variant="secondary">
                <DashboardGrid className={styles.overviewGrid}>
                    {/*{isCitiesLoading && <p>Загрузка городов...</p>}*/}

                    {/*{error && <p>Ошибка: {error}</p>}*/}

                    <DashboardCard className={styles.select}>
                        <div className={styles.cityHeader}>
                            <p className={styles.cityEyebrow}>Климат города</p>

                            <h2 className={styles.cityTitle}>
                                {currentCity?.name ?? "Выберите город"}
                            </h2>

                            <p className={styles.cityMeta}>
                                {currentCity?.country_code ?? "—"} · норма 1995–2025
                            </p>
                        </div>

                        <div className={styles.citySelect}>
    <span className={styles.citySelectLabel}>
      Сменить город
    </span>

                            {!isCitiesLoading && !error && (<CitySelect
                                cities={cities}
                                selectedCityId={currentCityId}
                                setSelectedCityId={setCurrentCityId}
                                placeholder="Выберите город"
                            />)}
                        </div>

                        <div className={styles.cityStats}>
                            <div className={styles.cityStat}>
      <span className={styles.cityStatLabel}>
        Средняя за год
      </span>

                                <strong className={styles.cityStatValue}>
                                    {isWeatherLoading ? "…" : formatTemperature(climateSummary?.annualMean)}
                                </strong>
                            </div>

                            <div className={styles.cityStat}>
      <span className={styles.cityStatLabel}>
        Больше осадков
      </span>

                                <strong className={styles.cityStatValue}>
                                    {isWeatherLoading ? "…" : climateSummary?.wettestMonth ?? "—"}
                                </strong>

                                {climateSummary && !isWeatherLoading && (<small className={styles.cityStatDetail}>
                                    {climateSummary.wettestMonthPrecipitation.toFixed(0)} мм
                                </small>)}
                            </div>
                        </div>
                    </DashboardCard>
                    <DashboardCard className={styles.chart}>
                        <div className={styles.chartHeader}>
                            <div>
                                <p className={styles.chartLabel}>
                                    Climate overview
                                </p>

                                <h2 className={styles.chartTitle}>
                                    {WEATHER_METRICS.find((metric) => metric.key === selectedMetric,)?.label}
                                </h2>
                            </div>

                            <div
                                className={styles.metricPicker}
                                role="group"
                            >
                                {WEATHER_METRICS.map((metric) => (<button
                                    key={metric.key}
                                    type="button"
                                    className={styles.metricButton}
                                    aria-pressed={selectedMetric === metric.key}
                                    onClick={() => setSelectedMetric(metric.key)}
                                >
                                    {metric.label}
                                </button>))}
                            </div>
                        </div>

                        <div className={styles.chartBody}>
                            {selectedMetric === "temperature" && (<TemperatureChart data={dailyWeather}/>)}

                            {selectedMetric !== "temperature" && (<div className={styles.chartPlaceholder}>
                                График показателя будет добавлен позже
                            </div>)}
                        </div>
                    </DashboardCard>
                </DashboardGrid>
            </DashboardCard>
        </DashboardGrid>
    </div>);
}

export default CityWeatherPage;
