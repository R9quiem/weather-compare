import { useMemo } from "react";
import { Line } from "recharts";

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

const TEMPERATURE_SERIES = {
    id: "city-temperature",
    label: "Средняя температура",
    meanKey: "temperature_2m_mean",
    minKey: "temperature_2m_min",
    maxKey: "temperature_2m_max",
    rangeKey: "temperatureRange",
    color: "#4f5fdb",
};
const APPARENT_TEMPERATURE_KEY = "apparent_temperature_mean";
const APPARENT_TEMPERATURE_COLOR = "#8f98a6";

function TemperatureChart({ data }) {
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

    return (
        <div className={styles.chart}>
            <div className={styles.averageBadge}>
                <span className={styles.averageBadgeItem}>
                    <i className={styles.airTemperatureKey} />
                    Температура воздуха
                </span>
                <span className={styles.averageBadgeItem}>
                    <i className={styles.apparentTemperatureKey} />
                    Ощущаемая температура
                </span>
            </div>

            <ClimateChart
                data={chartData}
                yDomain={yDomain}
                height={360}
                unit="°C"
                tooltipContent={
                    <TemperatureTooltip
                        series={[TEMPERATURE_SERIES]}
                        apparentTemperatureKey={APPARENT_TEMPERATURE_KEY}
                    />
                }
            >
                <TemperatureSeries {...TEMPERATURE_SERIES} />
                <Line
                    type="monotone"
                    dataKey={APPARENT_TEMPERATURE_KEY}
                    name="Средняя ощущаемая"
                    stroke={APPARENT_TEMPERATURE_COLOR}
                    strokeWidth={2}
                    strokeDasharray="7 5"
                    dot={false}
                    activeDot={{
                        r: 4,
                        fill: APPARENT_TEMPERATURE_COLOR,
                        stroke: "#ffffff",
                        strokeWidth: 2,
                    }}
                    isAnimationActive={false}
                />
                <TemperatureExtremes extremes={extremes} color={TEMPERATURE_SERIES.color} />
            </ClimateChart>
        </div>
    );
}

export default TemperatureChart;
