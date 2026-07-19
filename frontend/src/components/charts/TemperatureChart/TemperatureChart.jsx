import {useMemo} from "react";

import ClimateChart from "../ClimateChart/ClimateChart.jsx";
import TemperatureExtremes from "./TemperatureExtremes.jsx";
import TemperatureSeries from "./TemperatureSeries.jsx";
import TemperatureTooltip from "./TemperatureTooltip.jsx";
import {
    addTemperatureRange,
    getTemperatureDomain,
    getTemperatureExtremes,
} from "./temperatureUtils.js";

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

    return (
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
    );
}

export default TemperatureChart;
