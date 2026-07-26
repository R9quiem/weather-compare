import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";
import DashboardGrid from "../../components/DashboardGrid/DashboardGrid.jsx";

import { formatTemperature } from "./climateSummary.js";
import styles from "./CityWeatherPage.module.css";

const CLOUD_LABELS = {
    clear: "Ясное небо",
    partly_cloudy: "Переменная облачность",
    cloudy: "Пасмурное небо",
};

const WIND_LABELS = {
    N: "Северный",
    NE: "Северо-восточный",
    E: "Восточный",
    SE: "Юго-восточный",
    S: "Южный",
    SW: "Юго-западный",
    W: "Западный",
    NW: "Северо-западный",
};

function average(values) {
    const present = values.filter(Number.isFinite);
    return present.length ? present.reduce((sum, value) => sum + value, 0) / present.length : null;
}

function getCloudPreview(cloudCover) {
    const states = Object.keys(CLOUD_LABELS).map((key) => ({
        key,
        value: average(cloudCover.map((point) => point[key])),
    }));
    const dominant = states.reduce(
        (result, state) => (!result || (state.value ?? 0) > (result.value ?? 0) ? state : result),
        null
    );

    return {
        value: dominant ? CLOUD_LABELS[dominant.key] : "—",
        detail: Number.isFinite(dominant?.value)
            ? `Так классифицировано ${dominant.value.toFixed(0)}% дней`
            : "—",
    };
}

function getWindPreview(windRose, climateSummary) {
    const prevailing = windRose.reduce(
        (result, sector) => (!result || sector.frequency > result.frequency ? sector : result),
        null
    );

    return prevailing
        ? {
              value: WIND_LABELS[prevailing.direction] ?? prevailing.direction,
              detail: `Отсюда ветер приходит в ${prevailing.frequency.toFixed(1)}% наблюдений`,
          }
        : {
              value: climateSummary ? `${climateSummary.annualWindSpeed.toFixed(1)} км/ч` : "—",
              detail: "средняя скорость на высоте 10 м",
          };
}

function ClimateStats({
    climateSummary,
    cloudCover = [],
    windRose = [],
    selectedMetric,
    isLoading,
}) {
    const value = (formatter) => (isLoading ? "…" : formatter());
    const cloud = getCloudPreview(cloudCover);
    const wind = getWindPreview(windRose, climateSummary);
    const cards = [
        {
            key: "temperature",
            label: "Средняя температура",
            value: value(() => formatTemperature(climateSummary?.annualMean)),
            detail: value(() =>
                climateSummary
                    ? `Средние минимум и максимум: ${formatTemperature(climateSummary.annualMinMean)} / ${formatTemperature(climateSummary.annualMaxMean)}`
                    : "—"
            ),
        },
        {
            key: "precipitation",
            label: "Осадки за год",
            value: value(() =>
                climateSummary ? `${climateSummary.annualPrecipitation.toFixed(0)} мм` : "—"
            ),
            detail: value(() =>
                climateSummary
                    ? `Больше всего осадков: ${climateSummary.wettestMonth} · ${climateSummary.wettestMonthPrecipitation.toFixed(0)} мм`
                    : "—"
            ),
        },
        {
            key: "humidity",
            label: "Средняя влажность",
            value: value(() =>
                climateSummary ? `${climateSummary.annualHumidity.toFixed(0)}%` : "—"
            ),
            detail: value(() =>
                Number.isFinite(climateSummary?.monthlyHumidityMin)
                    ? `Диапазон по месяцам: ${climateSummary.monthlyHumidityMin.toFixed(0)}–${climateSummary.monthlyHumidityMax.toFixed(0)}%`
                    : "—"
            ),
        },
        {
            key: "wind",
            label: "Преобладающий ветер",
            value: value(() => wind.value),
            detail: value(() => wind.detail),
        },
        {
            key: "cloud",
            label: "Преобладающая облачность",
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
