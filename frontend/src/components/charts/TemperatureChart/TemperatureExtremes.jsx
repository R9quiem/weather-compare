import {ReferenceDot} from "recharts";

import {formatDate, formatTemperature} from "./temperatureUtils.js";

function ExtremeLabel({viewBox, point, kind, valueKey}) {
    if (!viewBox || !point) {
        return null;
    }

    const width = 88;
    const height = 34;
    const x = viewBox.x + viewBox.width / 2 - width / 2;
    const y = viewBox.y + viewBox.height / 2 - 42;

    return (
        <g pointerEvents="none">
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={9}
                fill="#ffffff"
                stroke="#cfd5df"
            />
            <text
                x={x + width / 2}
                y={y + 13}
                textAnchor="middle"
                fill="#343b47"
                fontSize={10}
                fontWeight={650}
            >
                {kind} {formatTemperature(point[valueKey])}
            </text>
            <text
                x={x + width / 2}
                y={y + 26}
                textAnchor="middle"
                fill="#7c8490"
                fontSize={9}
            >
                {formatDate(point.observed_date, true)}
            </text>
        </g>
    );
}

function TemperatureExtremes({
    extremes,
    minKey = "temperature_2m_min",
    maxKey = "temperature_2m_max",
    color = "#4f5fdb",
}) {
    if (!extremes) {
        return null;
    }

    return (
        <>
            <ReferenceDot
                x={extremes.max.observed_date}
                y={extremes.max[maxKey]}
                r={3.5}
                fill={color}
                stroke="#ffffff"
                strokeWidth={1.5}
                label={
                    <ExtremeLabel
                        point={extremes.max}
                        kind="Макс"
                        valueKey={maxKey}
                    />
                }
            />
            <ReferenceDot
                x={extremes.min.observed_date}
                y={extremes.min[minKey]}
                r={3.5}
                fill={color}
                stroke="#ffffff"
                strokeWidth={1.5}
                label={
                    <ExtremeLabel
                        point={extremes.min}
                        kind="Мин"
                        valueKey={minKey}
                    />
                }
            />
        </>
    );
}

export default TemperatureExtremes;
