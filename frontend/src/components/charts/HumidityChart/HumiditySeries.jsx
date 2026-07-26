import { useId } from "react";
import { Area, Line, ReferenceLine } from "recharts";

function HumiditySeries({
    dataKey = "relative_humidity_2m_mean",
    averageHumidity,
    color = "#3f77bf",
}) {
    const reactId = useId().replaceAll(":", "");
    const gradientId = `humidity-area-${reactId}`;

    return (
        <>
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1.0} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.25} />
                </linearGradient>
            </defs>

            {averageHumidity != null && (
                <ReferenceLine
                    y={averageHumidity}
                    stroke="#7f979b"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                />
            )}

            <Area
                type="monotone"
                dataKey={dataKey}
                baseValue={0}
                stroke="none"
                fill={`url(#${gradientId})`}
                tooltipType="none"
                legendType="none"
                isAnimationActive={false}
            />

            <Line
                type="monotone"
                dataKey={dataKey}
                name="Средняя влажность"
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

export default HumiditySeries;
