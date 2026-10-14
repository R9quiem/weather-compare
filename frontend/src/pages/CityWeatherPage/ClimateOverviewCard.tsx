import type {
    DailyWeather,
    WindRoseSector,
    CloudCover,
    WeatherMetric,
    WindView,
} from "../../types/weather.ts";
import CloudCoverChart from "../../components/charts/CloudCoverChart/CloudCoverChart.tsx";
import HumidityChart from "../../components/charts/HumidityChart/HumidityChart.tsx";
import PrecipitationChart from "../../components/charts/PrecipitationChart/PrecipitationChart.tsx";
import TemperatureChart from "../../components/charts/TemperatureChart/TemperatureChart.tsx";
import WindChart from "../../components/charts/WindChart/WindChart.tsx";
import WindRoseChart from "../../components/charts/WindRoseChart/WindRoseChart.tsx";
import DashboardCard from "../../components/DashboardCard/DashboardCard.tsx";
import { useTranslation } from "react-i18next";
import styles from "./CityWeatherPage.module.css";

interface ClimateOverviewCardProps {
    dailyWeather: DailyWeather[];
    windRose: WindRoseSector[];
    cloudCover: CloudCover[];
    selectedMetric: WeatherMetric;
    setSelectedMetric: (metric: WeatherMetric) => void;
    windView: WindView;
    setWindView: (view: WindView) => void;
}

const WEATHER_METRICS: WeatherMetric[] = [
    "temperature",
    "precipitation",
    "humidity",
    "wind",
    "cloud",
];

function ClimateOverviewCard({
    dailyWeather,
    windRose,
    cloudCover,
    selectedMetric,
    setSelectedMetric,
    windView,
    setWindView,
}: ClimateOverviewCardProps) {
    const { t } = useTranslation();
    const showWindRose = selectedMetric === "wind" && windView === "rose";
    const selectedMetricLabel = t(`metrics.${selectedMetric}`);
    const noteKey =
        selectedMetric === "wind" ? (showWindRose ? "windRose" : "windSpeed") : selectedMetric;
    const chartNote = t(`cityPage.chartNotes.${noteKey}`);

    return (
        <DashboardCard className={styles.chart}>
            <div className={styles.chartHeader}>
                <div className={styles.chartHeading}>
                    <div className={styles.chartTitleRow}>
                        <h2 className={styles.chartTitle}>{selectedMetricLabel}</h2>
                    </div>

                    {chartNote && <p className={styles.chartSubtitle}>{chartNote}</p>}
                </div>

                <div className={styles.metricPickerShell}>
                    <div className={styles.metricPicker} role="group">
                        {WEATHER_METRICS.map((metric) => {
                            const isWindMetric = metric === "wind";

                            return (
                                <div key={metric} className={styles.metricButtonSlot}>
                                    <button
                                        type="button"
                                        className={styles.metricButton}
                                        aria-pressed={selectedMetric === metric}
                                        onClick={() => setSelectedMetric(metric)}
                                    >
                                        {t(`metrics.${metric}`)}
                                    </button>

                                    {isWindMetric && selectedMetric === "wind" && (
                                        <div
                                            className={styles.windViewPicker}
                                            role="group"
                                            aria-label={t("cityPage.windView")}
                                        >
                                            <button
                                                type="button"
                                                className={styles.windViewButton}
                                                aria-pressed={windView === "speed"}
                                                onClick={() => setWindView("speed")}
                                            >
                                                {t("cityPage.speed")}
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.windViewButton}
                                                aria-pressed={windView === "rose"}
                                                onClick={() => setWindView("rose")}
                                            >
                                                {t("cityPage.windRose")}
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
                {selectedMetric === "temperature" && <TemperatureChart data={dailyWeather} />}

                {selectedMetric === "precipitation" && <PrecipitationChart data={dailyWeather} />}

                {selectedMetric === "humidity" && <HumidityChart data={dailyWeather} />}

                {selectedMetric === "wind" && windView === "speed" && (
                    <WindChart data={dailyWeather} />
                )}

                {showWindRose && <WindRoseChart data={windRose} />}

                {selectedMetric === "cloud" && <CloudCoverChart data={cloudCover} />}

                {!["temperature", "precipitation", "humidity", "wind", "cloud"].includes(
                    selectedMetric
                ) && (
                    <div className={styles.chartPlaceholder}>{t("cityPage.chartPlaceholder")}</div>
                )}
            </div>
        </DashboardCard>
    );
}

export default ClimateOverviewCard;
