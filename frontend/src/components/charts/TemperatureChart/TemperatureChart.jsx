import { useMemo } from "react";
import { Line, ReferenceDot } from "recharts";
import { useTranslation } from "react-i18next";

import ClimateChart from "../ClimateChart/ClimateChart.jsx";
import TemperatureExtremes from "./TemperatureExtremes.jsx";
import TemperatureSeries from "./TemperatureSeries.jsx";
import TemperatureTooltip from "./TemperatureTooltip.jsx";
import {
    addTemperatureRange,
    getTemperatureDomain,
    getTemperatureExtremes,
} from "./temperatureUtils.js";
import styles from "./TemperatureChart.module.css";
import { useMeasurementFormatter } from "../../../units/useMeasurementFormatter.js";

const TEMPERATURE_SERIES = {
    id: "city-temperature",
    meanKey: "temperature_2m_mean",
    minKey: "temperature_2m_min",
    maxKey: "temperature_2m_max",
    rangeKey: "temperatureRange",
    color: "var(--color-accent-primary)",
};
const APPARENT_TEMPERATURE_KEY = "apparent_temperature_mean";
const APPARENT_TEMPERATURE_COLOR = "var(--chart-secondary)";

function TemperatureChart({ data }) {
    const { t } = useTranslation();
    const { convertValue, unitLabel } = useMeasurementFormatter();
    const temperatureSeries = {
        ...TEMPERATURE_SERIES,
        label: t("charts.averageTemperature"),
    };
    const chartData = useMemo(() => addTemperatureRange(data), [data]);
    const yDomain = useMemo(() => {
        const baseDomain = getTemperatureDomain(chartData, [TEMPERATURE_SERIES]);
        const apparentValues = chartData
            .map((point) => point[APPARENT_TEMPERATURE_KEY])
            .filter(Number.isFinite);

        if (!apparentValues.length) return baseDomain;

        return [
            Math.min(baseDomain[0], Math.floor(Math.min(...apparentValues) - 2)),
            Math.max(baseDomain[1], Math.ceil(Math.max(...apparentValues) + 2)),
        ];
    }, [chartData]);
    const extremes = useMemo(() => getTemperatureExtremes(chartData), [chartData]);
    const todayPoint = useMemo(() => {
        const today = new Date();
        const dateKey = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(
            today.getDate()
        ).padStart(2, "0")}`;

        return chartData.find((point) => point.observed_date === dateKey) ?? null;
    }, [chartData]);

    return (
        <div className={styles.chart}>
            <div className={styles.averageBadge}>
                <span className={styles.averageBadgeItem}>
                    <i className={styles.airTemperatureKey} />
                    {t("charts.airTemperature")}
                </span>
                <span className={styles.averageBadgeItem}>
                    <i className={styles.apparentTemperatureKey} />
                    {t("charts.apparentTemperature")}
                </span>
                <span className={styles.averageBadgeItem}>
                    <i className={styles.todayKey} />
                    {t("charts.today")}
                </span>
            </div>

            <ClimateChart
                data={chartData}
                yDomain={yDomain}
                height={360}
                yTickFormatter={(value) =>
                    `${convertValue("temperature", value).toFixed(0)} ${unitLabel("temperature")}`
                }
                tooltipContent={
                    <TemperatureTooltip
                        series={[temperatureSeries]}
                        apparentTemperatureKey={APPARENT_TEMPERATURE_KEY}
                    />
                }
            >
                <TemperatureSeries {...temperatureSeries} />
                <Line
                    type="monotone"
                    dataKey={APPARENT_TEMPERATURE_KEY}
                    name={t("charts.averageApparent")}
                    stroke={APPARENT_TEMPERATURE_COLOR}
                    strokeWidth={2}
                    strokeDasharray="7 5"
                    dot={false}
                    activeDot={{
                        r: 4,
                        fill: APPARENT_TEMPERATURE_COLOR,
                        stroke: "var(--color-white)",
                        strokeWidth: 2,
                    }}
                    isAnimationActive={false}
                />
                <TemperatureExtremes extremes={extremes} color={TEMPERATURE_SERIES.color} />
                {Number.isFinite(todayPoint?.[TEMPERATURE_SERIES.meanKey]) && (
                    <ReferenceDot
                        x={todayPoint.observed_date}
                        y={todayPoint[TEMPERATURE_SERIES.meanKey]}
                        r={3.5}
                        fill="var(--chart-today)"
                        stroke="var(--color-surface)"
                        strokeWidth={1}
                    />
                )}
            </ClimateChart>
        </div>
    );
}

export default TemperatureChart;
