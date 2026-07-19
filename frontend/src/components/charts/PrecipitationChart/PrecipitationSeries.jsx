import {useId} from "react";
import {Bar, ReferenceLine} from "recharts";

function PrecipitationSeries({
    dataKey = "precipitation",
    monthlyAverage,
    color = "#4f5fdb",
}) {
    const reactId = useId().replaceAll(":", "");
    const gradientId = `precipitation-bars-${reactId}`;

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
                    <stop offset="0%" stopColor={color} stopOpacity={0.96}/>
                    <stop offset="100%" stopColor="#6276dc" stopOpacity={0.9}/>
                </linearGradient>
            </defs>

            <ReferenceLine
                y={monthlyAverage}
                stroke="#8f98a6"
                strokeWidth={1}
                strokeDasharray="4 4"
            />

            <Bar
                dataKey={dataKey}
                name="Средние осадки"
                barSize={30}
                radius={[8, 8, 2, 2]}
                fill={`url(#${gradientId})`}
                activeBar={{fill: "#4050c8"}}
                isAnimationActive={false}
            />
        </>
    );
}

export default PrecipitationSeries;
