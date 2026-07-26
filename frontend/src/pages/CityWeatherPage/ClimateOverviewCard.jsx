import CloudCoverChart from "../../components/charts/CloudCoverChart/CloudCoverChart.jsx";
import HumidityChart from "../../components/charts/HumidityChart/HumidityChart.jsx";
import PrecipitationChart from "../../components/charts/PrecipitationChart/PrecipitationChart.jsx";
import TemperatureChart from "../../components/charts/TemperatureChart/TemperatureChart.jsx";
import WindChart from "../../components/charts/WindChart/WindChart.jsx";
import WindRoseChart from "../../components/charts/WindRoseChart/WindRoseChart.jsx";
import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";
import { useTranslation } from "react-i18next";

import styles from "./CityWeatherPage.module.css";

const WEATHER_METRICS = ["temperature", "precipitation", "humidity", "wind", "cloud"];

function ClimateOverviewCard({
    dailyWeather,
    windRose,
    cloudCover,
    selectedMetric,
    setSelectedMetric,
    windView,
    setWindView,
}) {
    const { t } = useTranslation();
    const showWindRose = selectedMetric === "wind" && windView === "rose";
    const selectedMetricLabel = t(`metrics.${selectedMetric}`);
    const noteKey =
        selectedMetric === "wind" ? (showWindRose ? "windRose" : "windSpeed") : selectedMetric;
    let chartNote = t(`cityPage.chartNotes.${noteKey}`);

    if (selectedMetric === "cloud") {
        chartNote += cloudCover?.[0]?.calibrated
            ? t("cityPage.chartNotes.calibrated")
            : t("cityPage.chartNotes.reanalysis");
    }

    return (
        <DashboardCard className={styles.chart}>
            <div className={styles.chartHeader}>
                <div className={styles.chartHeading}>
                    <p className={styles.chartLabel}>{t("cityPage.overview")}</p>
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
