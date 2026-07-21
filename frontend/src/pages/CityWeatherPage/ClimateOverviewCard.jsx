import {useState} from "react";

import HumidityChart from "../../components/charts/HumidityChart/HumidityChart.jsx";
import PrecipitationChart from "../../components/charts/PrecipitationChart/PrecipitationChart.jsx";
import TemperatureChart from "../../components/charts/TemperatureChart/TemperatureChart.jsx";
import WindChart from "../../components/charts/WindChart/WindChart.jsx";
import WindRoseChart from "../../components/charts/WindRoseChart/WindRoseChart.jsx";
import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";

import styles from "./CityWeatherPage.module.css";

const WEATHER_METRICS = [
    {key: "temperature", label: "Температура"},
    {key: "precipitation", label: "Осадки"},
    {key: "humidity", label: "Влажность"},
    {key: "wind", label: "Ветер"},
    {key: "cloud", label: "Облачность"},
];

const CHART_NOTES = {
    temperature: "Температура воздуха на высоте 2 м · среднесуточные значения",
    precipitation: "Атмосферные осадки (дождь и снег) · среднемесячная сумма",
    humidity: "Относительная влажность воздуха на высоте 2 м · среднесуточные значения",
    windSpeed: "Скорость ветра на высоте 10 м · среднесуточные значения",
    windRose: "Направления ветра на высоте 10 м · распределение по почасовым наблюдениям",
};

function ClimateOverviewCard({dailyWeather, windRose}) {
    const [selectedMetric, setSelectedMetric] = useState("temperature");
    const [windView, setWindView] = useState("speed");
    const showWindRose = selectedMetric === "wind" && windView === "rose";

    const selectedMetricLabel = WEATHER_METRICS.find(
        (metric) => metric.key === selectedMetric,
    )?.label;
    const chartNote = selectedMetric === "wind"
        ? CHART_NOTES[showWindRose ? "windRose" : "windSpeed"]
        : CHART_NOTES[selectedMetric];

    return (
        <DashboardCard className={styles.chart}>
            <div className={styles.chartHeader}>
                <div className={styles.chartHeading}>
                    <p className={styles.chartLabel}>Обзор климата</p>
                    <div className={styles.chartTitleRow}>
                        <h2 className={styles.chartTitle}>{selectedMetricLabel}</h2>
                    </div>

                    {chartNote && (
                        <p className={styles.chartSubtitle}>{chartNote}</p>
                    )}
                </div>

                <div className={styles.metricPickerShell}>
                    <div className={styles.metricPicker} role="group">
                        {WEATHER_METRICS.map((metric) => {
                            const isWindMetric = metric.key === "wind";

                            return (
                                <div
                                    key={metric.key}
                                    className={styles.metricButtonSlot}
                                >
                                    <button
                                        type="button"
                                        className={styles.metricButton}
                                        aria-pressed={selectedMetric === metric.key}
                                        onClick={() => setSelectedMetric(metric.key)}
                                    >
                                        {metric.label}
                                    </button>

                                    {isWindMetric && selectedMetric === "wind" && (
                                        <div
                                            className={styles.windViewPicker}
                                            role="group"
                                            aria-label="Вид графика ветра"
                                        >
                                            <button
                                                type="button"
                                                className={styles.windViewButton}
                                                aria-pressed={windView === "speed"}
                                                onClick={() => setWindView("speed")}
                                            >
                                                Скорость
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.windViewButton}
                                                aria-pressed={windView === "rose"}
                                                onClick={() => setWindView("rose")}
                                            >
                                                Роза ветров
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className={styles.chartBody}>
                {selectedMetric === "temperature" && (
                    <TemperatureChart data={dailyWeather}/>
                )}

                {selectedMetric === "precipitation" && (
                    <PrecipitationChart data={dailyWeather}/>
                )}

                {selectedMetric === "humidity" && (
                    <HumidityChart data={dailyWeather}/>
                )}

                {selectedMetric === "wind" && windView === "speed" && (
                    <WindChart data={dailyWeather}/>
                )}

                {showWindRose && (
                    <WindRoseChart data={windRose}/>
                )}

                {!["temperature", "precipitation", "humidity", "wind"].includes(selectedMetric) && (
                    <div className={styles.chartPlaceholder}>
                        График показателя будет добавлен позже
                    </div>
                )}

            </div>
        </DashboardCard>
    );
}

export default ClimateOverviewCard;
