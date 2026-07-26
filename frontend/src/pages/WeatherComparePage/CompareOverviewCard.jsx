import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";
import {
    CompareCloudCoverChart,
    CompareHumidityChart,
    ComparePrecipitationChart,
    CompareWindChart,
    CompareWindRoseChart,
} from "../../components/charts/CompareMetricCharts/CompareMetricCharts.jsx";
import CompareTemperatureChart from "../../components/charts/CompareTemperatureChart.jsx";

import styles from "./WeatherComparePage.module.css";

const WEATHER_METRICS = [
    { key: "temperature", label: "Температура" },
    { key: "precipitation", label: "Осадки" },
    { key: "humidity", label: "Влажность" },
    { key: "wind", label: "Ветер" },
    { key: "cloud", label: "Облачность" },
];

function CompareOverviewCard({
    firstWeather,
    secondWeather,
    firstCityName,
    secondCityName,
    selectedMetric,
    setSelectedMetric,
    windView,
    setWindView,
    isLoading,
    error,
}) {
    const selectedMetricLabel = WEATHER_METRICS.find(
        (metric) => metric.key === selectedMetric
    )?.label;
    const chartProps = {
        firstData: firstWeather.data,
        secondData: secondWeather.data,
        firstCityName,
        secondCityName,
    };

    return (
        <DashboardCard className={styles.chartCard}>
            <div className={styles.chartSection}>
                <div className={styles.chartHeader}>
                    <div>
                        <p className={styles.chartEyebrow}>Обзор климата</p>
                        <h2>{selectedMetricLabel}</h2>
                    </div>

                    <div className={styles.chartControls}>
                        <div
                            className={styles.metricPicker}
                            role="group"
                            aria-label="Показатель для сравнения"
                        >
                            {WEATHER_METRICS.map((metric) => (
                                <button
                                    key={metric.key}
                                    type="button"
                                    className={styles.metricButton}
                                    aria-pressed={selectedMetric === metric.key}
                                    onClick={() => setSelectedMetric(metric.key)}
                                >
                                    {metric.label}
                                </button>
                            ))}
                        </div>

                        {selectedMetric === "wind" && (
                            <div
                                className={styles.windPicker}
                                role="group"
                                aria-label="Вид графика ветра"
                            >
                                <button
                                    type="button"
                                    aria-pressed={windView === "speed"}
                                    onClick={() => setWindView("speed")}
                                >
                                    Скорость
                                </button>
                                <button
                                    type="button"
                                    aria-pressed={windView === "rose"}
                                    onClick={() => setWindView("rose")}
                                >
                                    Роза ветров
                                </button>
                            </div>
                        )}

                        {selectedMetric !== "cloud" && (
                            <div className={styles.legend} aria-label="Легенда графика">
                                <span>
                                    <i className={styles.blueDot} /> {firstCityName}
                                </span>
                                <span>
                                    <i className={styles.orangeDot} /> {secondCityName}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.chartBody}>
                    {isLoading && (
                        <div className={styles.loading}>Загружаем климатические данные…</div>
                    )}

                    {!isLoading && !error && selectedMetric === "temperature" && (
                        <CompareTemperatureChart
                            firstCityWeather={firstWeather.data}
                            secondCityWeather={secondWeather.data}
                            firstCityName={firstCityName}
                            secondCityName={secondCityName}
                        />
                    )}
                    {!isLoading && !error && selectedMetric === "precipitation" && (
                        <ComparePrecipitationChart {...chartProps} />
                    )}
                    {!isLoading && !error && selectedMetric === "humidity" && (
                        <CompareHumidityChart {...chartProps} />
                    )}
                    {!isLoading && !error && selectedMetric === "wind" && windView === "speed" && (
                        <CompareWindChart {...chartProps} />
                    )}
                    {!isLoading && !error && selectedMetric === "wind" && windView === "rose" && (
                        <CompareWindRoseChart
                            firstData={firstWeather.windRose}
                            secondData={secondWeather.windRose}
                            firstCityName={firstCityName}
                            secondCityName={secondCityName}
                        />
                    )}
                    {!isLoading && !error && selectedMetric === "cloud" && (
                        <CompareCloudCoverChart
                            firstData={firstWeather.cloudCover}
                            secondData={secondWeather.cloudCover}
                            firstCityName={firstCityName}
                            secondCityName={secondCityName}
                        />
                    )}
                </div>
            </div>
        </DashboardCard>
    );
}

export default CompareOverviewCard;
