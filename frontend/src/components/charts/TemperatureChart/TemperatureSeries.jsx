import {useId} from "react";
import {Area, Line} from "recharts";

function TemperatureSeries({
    id,
    label,
    meanKey,
    minKey,
    maxKey,
    rangeKey,
    color = "#4f5fdb",
}) {
    const reactId = useId().replaceAll(":", "");
    const gradientId = `temperature-range-${id}-${reactId}`;

    return (
        <>
            <defs>
                <linearGradient
                    id={gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop offset="0%" stopColor={color} stopOpacity={0.34}/>
                    <stop offset="100%" stopColor={color} stopOpacity={0.18}/>
                </linearGradient>
            </defs>

            <Area
                type="monotone"
                dataKey={rangeKey}
                stroke="none"
                fill={`url(#${gradientId})`}
                tooltipType="none"
                legendType="none"
                isAnimationActive={false}
            />

            <Line
                type="monotone"
                dataKey={maxKey}
                stroke={color}
                strokeOpacity={0.48}
                strokeWidth={1}
                dot={false}
                activeDot={false}
                tooltipType="none"
                legendType="none"
                isAnimationActive={false}
            />

            <Line
                type="monotone"
                dataKey={minKey}
                stroke={color}
                strokeOpacity={0.48}
                strokeWidth={1}
                dot={false}
                activeDot={false}
                tooltipType="none"
                legendType="none"
                isAnimationActive={false}
            />

            <Line
                type="monotone"
                dataKey={meanKey}
                name={label}
                stroke={color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                    r: 4,
                    fill: color,
                    stroke: "#ffffff",
                    strokeWidth: 2,
                }}
                isAnimationActive={false}
            />
        </>
    );
}

export default TemperatureSeries;
