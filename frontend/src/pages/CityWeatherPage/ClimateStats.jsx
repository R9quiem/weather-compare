import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";
import DashboardGrid from "../../components/DashboardGrid/DashboardGrid.jsx";
import { useTranslation } from "react-i18next";

import { getMonthName } from "../../utils/localization.js";
import { useMeasurementFormatter } from "../../units/useMeasurementFormatter.js";
import styles from "./CityWeatherPage.module.css";

const CLOUD_KEYS = ["clear", "partly_cloudy", "cloudy"];

function average(values) {
    const present = values.filter(Number.isFinite);
    return present.length ? present.reduce((sum, value) => sum + value, 0) / present.length : null;
}

function getCloudPreview(t, cloudCover) {
    const states = CLOUD_KEYS.map((key) => ({
        key,
        value: average(cloudCover.map((point) => point[key])),
    }));
    const dominant = states.reduce(
        (result, state) => (!result || (state.value ?? 0) > (result.value ?? 0) ? state : result),
        null
    );

    return {
        value: dominant ? t(`cityPage.stats.cloud.${dominant.key}`) : "—",
        detail: Number.isFinite(dominant?.value)
            ? t("cityPage.stats.cloudFrequency", { value: dominant.value.toFixed(0) })
            : "—",
    };
}

function getWindPreview(t, windRose, climateSummary, formatWind) {
    const prevailing = windRose.reduce(
        (result, sector) => (!result || sector.frequency > result.frequency ? sector : result),
        null
    );

    return prevailing
        ? {
              value: t(`directions.${prevailing.direction}`, {
                  defaultValue: prevailing.direction,
              }),
              detail: t("cityPage.stats.windFrequency", {
                  value: prevailing.frequency.toFixed(1),
              }),
          }
        : {
              value: climateSummary
                  ? formatWind(climateSummary.annualWindSpeed)
                  : "—",
              detail: t("cityPage.stats.windFallback"),
          };
}

function ClimateStats({
    climateSummary,
    cloudCover = [],
    windRose = [],
    selectedMetric,
    isLoading,
}) {
    const { t } = useTranslation();
    const { formatPrecipitation, formatTemperature, formatWind } = useMeasurementFormatter();
    const value = (formatter) => (isLoading ? "…" : formatter());
    const cloud = getCloudPreview(t, cloudCover);
    const wind = getWindPreview(t, windRose, climateSummary, formatWind);
    const cards = [
        {
            key: "temperature",
            label: t("cityPage.stats.meanTemperature"),
            value: value(() => formatTemperature(climateSummary?.annualMean)),
            detail: value(() =>
                climateSummary
                    ? t("cityPage.stats.temperatureRange", {
                          min: formatTemperature(climateSummary.annualMinMean),
                          max: formatTemperature(climateSummary.annualMaxMean),
                      })
                    : "—"
            ),
        },
        {
            key: "precipitation",
            label: t("cityPage.stats.annualPrecipitation"),
            value: value(() =>
                climateSummary
                    ? formatPrecipitation(climateSummary.annualPrecipitation)
                    : "—"
            ),
            detail: value(() =>
                climateSummary
                    ? t("cityPage.stats.wettestMonth", {
                          month: getMonthName(t, climateSummary.wettestMonthIndex),
                          value: formatPrecipitation(climateSummary.wettestMonthPrecipitation),
                      })
                    : "—"
            ),
        },
        {
            key: "humidity",
            label: t("cityPage.stats.meanHumidity"),
            value: value(() =>
                climateSummary ? `${climateSummary.annualHumidity.toFixed(0)}%` : "—"
            ),
            detail: value(() =>
                Number.isFinite(climateSummary?.monthlyHumidityMin)
                    ? t("cityPage.stats.humidityRange", {
                          min: climateSummary.monthlyHumidityMin.toFixed(0),
                          max: climateSummary.monthlyHumidityMax.toFixed(0),
                      })
                    : "—"
            ),
        },
        {
            key: "wind",
            label: t("cityPage.stats.prevailingWind"),
            value: value(() => wind.value),
            detail: value(() => wind.detail),
        },
        {
            key: "cloud",
            label: t("cityPage.stats.prevailingCloud"),
            value: value(() => cloud.value),
            detail: value(() => cloud.detail),
        },
    ].filter((card) => card.key !== selectedMetric);

    return (
        <DashboardGrid className={styles.climateStats}>
            {cards.map((card) => (
                <DashboardCard
                    key={card.key}
                    className={`${styles.climateStat} ${styles[`climateStat_${card.key}`]}`}
                >
                    <div className={styles.climateStatHeader}>
                        <span className={styles.climateStatMarker} />
                        <span className={styles.climateStatLabel}>{card.label}</span>
                    </div>
                    <strong className={styles.climateStatValue}>{card.value}</strong>
                    <small className={styles.climateStatDetail}>{card.detail}</small>
                </DashboardCard>
            ))}
        </DashboardGrid>
    );
}

export default ClimateStats;
