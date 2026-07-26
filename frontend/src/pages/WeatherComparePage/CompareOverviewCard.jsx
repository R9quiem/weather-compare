import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";
import { useTranslation } from "react-i18next";
import {
    CompareCloudCoverChart,
    CompareHumidityChart,
    ComparePrecipitationChart,
    CompareWindChart,
    CompareWindRoseChart,
} from "../../components/charts/CompareMetricCharts/CompareMetricCharts.jsx";
import CompareTemperatureChart from "../../components/charts/CompareTemperatureChart.jsx";

import styles from "./WeatherComparePage.module.css";

const WEATHER_METRICS = ["temperature", "precipitation", "humidity", "wind", "cloud"];

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
    const { t } = useTranslation();
    const selectedMetricLabel = t(`metrics.${selectedMetric}`);
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
                        <p className={styles.chartEyebrow}>{t("compare.overview")}</p>
                        <h2>{selectedMetricLabel}</h2>
                    </div>

                    <div className={styles.chartControls}>
                        <div
                            className={styles.metricPicker}
                            role="group"
                            aria-label={t("compare.metricSelection")}
                        >
                            {WEATHER_METRICS.map((metric) => (
                                <button
                                    key={metric}
                                    type="button"
                                    className={styles.metricButton}
                                    aria-pressed={selectedMetric === metric}
                                    onClick={() => setSelectedMetric(metric)}
                                >
                                    {t(`metrics.${metric}`)}
                                </button>
                            ))}
                        </div>

                        {selectedMetric === "wind" && (
                            <div
                                className={styles.windPicker}
                                role="group"
                                aria-label={t("compare.windView")}
                            >
                                <button
                                    type="button"
                                    aria-pressed={windView === "speed"}
                                    onClick={() => setWindView("speed")}
                                >
                                    {t("cityPage.speed")}
                                </button>
                                <button
                                    type="button"
                                    aria-pressed={windView === "rose"}
                                    onClick={() => setWindView("rose")}
                                >
                                    {t("cityPage.windRose")}
                                </button>
                            </div>
                        )}

                        {selectedMetric !== "cloud" && (
                            <div className={styles.legend} aria-label={t("compare.legend")}>
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
                        <div className={styles.loading}>{t("compare.loadingClimate")}</div>
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
