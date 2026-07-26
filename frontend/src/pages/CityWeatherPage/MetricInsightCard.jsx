import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";

import { getMetricInsight } from "./metricInsights.js";
import styles from "./CityWeatherPage.module.css";

function TemperatureVisual({ visual }) {
    return (
        <div className={styles.temperatureVisual}>
            <span>Средняя ощущаемая температура</span>
            <strong>{visual.apparent}</strong>
            <small>{visual.difference}</small>
        </div>
    );
}

function PrecipitationVisual({ visual }) {
    return (
        <div className={styles.precipitationVisual}>
            <span className={styles.seasonMark}>Сезонный максимум</span>
            <strong>{visual.season}</strong>
            <small>{visual.share}</small>
        </div>
    );
}

function HumidityVisual({ visual }) {
    return (
        <div className={styles.humidityVisual}>
            <div
                className={styles.humidityGauge}
                style={{ "--humidity-level": `${visual.level * 3.6}deg` }}
            >
                <span>{visual.level}%</span>
            </div>
            <p>{visual.caption}</p>
        </div>
    );
}

function WindVisual({ visual }) {
    if (visual.mode === "rose") {
        return (
            <div className={styles.windRoseVisual}>
                <div className={styles.miniCompass}>
                    <span className={styles.compassNorth}>С</span>
                    <div
                        className={styles.compassArrow}
                        style={{ transform: `rotate(${visual.angle}deg)` }}
                    />
                </div>
                <p>Стрелка показывает, откуда чаще всего приходит ветер</p>
            </div>
        );
    }

    return (
        <div className={styles.windSpeedVisual}>
            <strong>{visual.range}</strong>
            <div>
                <span>Сезонная изменчивость</span>
                <p>{visual.category}</p>
            </div>
        </div>
    );
}

function CloudVisual({ visual }) {
    return (
        <div className={styles.cloudVisual}>
            {visual.segments.map((segment) => (
                <div
                    key={segment.name}
                    className={styles.cloudSegment}
                    style={{ flexGrow: segment.value ?? 0, backgroundColor: segment.color }}
                >
                    <span>{segment.shortLabel}</span>
                </div>
            ))}
        </div>
    );
}

function MetricVisual({ insight }) {
    if (!insight?.visual) return null;

    switch (insight.variant) {
        case "temperature":
            return <TemperatureVisual visual={insight.visual} />;
        case "precipitation":
            return <PrecipitationVisual visual={insight.visual} />;
        case "humidity":
            return <HumidityVisual visual={insight.visual} />;
        case "wind":
            return <WindVisual visual={insight.visual} />;
        case "cloud":
            return <CloudVisual visual={insight.visual} />;
        default:
            return null;
    }
}

function MetricInsightCard({
    selectedMetric,
    dailyWeather,
    windRose,
    cloudCover,
    windView,
    isLoading,
}) {
    const insight = getMetricInsight(selectedMetric, dailyWeather, windRose, cloudCover, windView);

    const layoutClass = insight?.visual?.mode
        ? styles[`insight_${insight.variant}_${insight.visual.mode}`]
        : "";

    return (
        <DashboardCard
            className={`${styles.metricInsight} ${styles[`insight_${insight?.variant ?? selectedMetric}`]} ${layoutClass}`}
        >
            <div className={`${styles.insightAccent} ${styles[selectedMetric]}`} />
            <p className={styles.insightEyebrow}>
                {isLoading ? "Анализируем климат" : (insight?.eyebrow ?? "Климатический профиль")}
            </p>
            <div className={styles.insightHeading}>
                <h2>{insight?.title ?? "Нет данных"}</h2>
                {(isLoading || insight?.value) && (
                    <strong>{isLoading ? "…" : insight.value}</strong>
                )}
            </div>
            <p className={styles.insightDetail}>
                {insight?.detail ?? "Выберите город, чтобы увидеть климатическую характеристику"}
            </p>

            {!isLoading && <MetricVisual insight={insight} />}

            <div className={styles.insightSecondary}>
                {(
                    insight?.secondary ?? [
                        { label: "—", value: "—" },
                        { label: "—", value: "—" },
                    ]
                ).map((item, index) => (
                    <div key={`${item.label}-${index}`}>
                        <span>{item.label}</span>
                        <strong>{isLoading ? "…" : item.value}</strong>
                        {item.detail && <small>{item.detail}</small>}
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
}

export default MetricInsightCard;
