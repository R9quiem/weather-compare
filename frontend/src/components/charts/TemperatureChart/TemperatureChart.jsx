import {useMemo} from "react";

import ClimateChart from "../ClimateChart/ClimateChart.jsx";
import TemperatureExtremes from "./TemperatureExtremes.jsx";
import TemperatureSeries from "./TemperatureSeries.jsx";
import TemperatureTooltip from "./TemperatureTooltip.jsx";
import {
    addTemperatureRange,
    formatTemperature,
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

function TemperatureChart({data}) {
    const chartData = useMemo(() => addTemperatureRange(data), [data]);
    const yDomain = useMemo(
        () => getTemperatureDomain(chartData, [TEMPERATURE_SERIES]),
        [chartData],
    );
    const extremes = useMemo(
        () => getTemperatureExtremes(chartData),
        [chartData],
    );
    const averageTemperature = useMemo(() => {
        const temperatures = data
            .map((point) => point.temperature_2m_mean)
            .filter(Number.isFinite);

        if (temperatures.length === 0) {
            return null;
        }

        return temperatures.reduce(
            (total, temperature) => total + temperature,
            0,
        ) / temperatures.length;
    }, [data]);

    return (
        <div className={styles.chart}>
            {averageTemperature != null && (
                <div className={styles.averageBadge}>
                    <span>Средняя температура</span>
                    <strong>{formatTemperature(averageTemperature)}</strong>
                </div>
            )}

            <ClimateChart
                data={chartData}
                yDomain={yDomain}
                height={360}
                unit="°C"
                tooltipContent={
                    <TemperatureTooltip series={[TEMPERATURE_SERIES]}/>
                }
            >
                <TemperatureSeries {...TEMPERATURE_SERIES}/>
                <TemperatureExtremes
                    extremes={extremes}
                    color={TEMPERATURE_SERIES.color}
                />
            </ClimateChart>
        </div>
    );
}

export default TemperatureChart;
