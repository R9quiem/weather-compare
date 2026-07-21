import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";
import DashboardGrid from "../../components/DashboardGrid/DashboardGrid.jsx";

import {formatTemperature} from "./climateSummary.js";
import styles from "./CityWeatherPage.module.css";

function ClimateStats({climateSummary, isLoading}) {
    const value = (formatter) => isLoading ? "…" : formatter();

    return (
        <DashboardGrid className={styles.climateStats}>
            <DashboardCard className={`${styles.climateStat} ${styles.temperatureClimateStat}`}>
                <span className={styles.climateStatLabel}>Средняя температура</span>
                <div className={styles.temperatureStatValues}>
                    <strong className={styles.temperatureMeanValue}>
                        {value(() => formatTemperature(climateSummary?.annualMean))}
                    </strong>
                    <div className={styles.temperatureRange}>
                        <span className={styles.temperatureRangeItem}>
                            <small>Средний минимум</small>
                            <strong>{value(() => formatTemperature(climateSummary?.annualMinMean))}</strong>
                        </span>
                        <span className={styles.temperatureRangeItem}>
                            <small>Средний максимум</small>
                            <strong>{value(() => formatTemperature(climateSummary?.annualMaxMean))}</strong>
                        </span>
                    </div>
                </div>
            </DashboardCard>

            <DashboardCard className={styles.climateStat}>
                <span className={styles.climateStatLabel}>Больше всего осадков</span>
                <strong className={styles.climateStatValue}>
                    {value(() => climateSummary?.wettestMonth ?? "—")}
                </strong>
                <small className={styles.climateStatDetail}>
                    {value(() => climateSummary
                        ? `${climateSummary.wettestMonthPrecipitation.toFixed(0)} мм`
                        : "—")}
                </small>
            </DashboardCard>

            <DashboardCard className={styles.climateStat}>
                <span className={styles.climateStatLabel}>Средняя влажность</span>
                <strong className={styles.climateStatValue}>
                    {value(() => climateSummary
                        ? `${climateSummary.annualHumidity.toFixed(0)}%`
                        : "—")}
                </strong>
                <small className={styles.climateStatDetail}>за год</small>
            </DashboardCard>

            <DashboardCard className={styles.climateStat}>
                <span className={styles.climateStatLabel}>Средняя скорость ветра</span>
                <strong className={styles.climateStatValue}>
                    {value(() => climateSummary
                        ? `${climateSummary.annualWindSpeed.toFixed(1)} км/ч`
                        : "—")}
                </strong>
                <small className={styles.climateStatDetail}>на высоте 10 м</small>
            </DashboardCard>
        </DashboardGrid>
    );
}

export default ClimateStats;
