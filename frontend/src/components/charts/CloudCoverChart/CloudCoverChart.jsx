import { Area } from "recharts";

import ClimateChart from "../ClimateChart/ClimateChart.jsx";
import CloudCoverTooltip from "./CloudCoverTooltip.jsx";

const CLOUD_COVER_SERIES = [
    {
        key: "clear",
        label: "Ясные дни",
        color: "#95a2e3",
        fill: "#8fc5f4",
    },
    {
        key: "partly_cloudy",
        label: "Переменная облачность",
        color: "#7292bd",
        fill: "#c9d1dc",
    },
    {
        key: "cloudy",
        label: "Пасмурные дни",
        color: "#667382",
        fill: "#687484",
    },
];

function CloudCoverChart({ data }) {
    return (
        <ClimateChart
            data={data}
            yDomain={[0, 100]}
            yTicks={[0, 25, 50, 75, 100]}
            yTickFormatter={(value) => `${value}%`}
            height={360}
            timeScale="monthly"
            showLegend
            tooltipCursor={false}
            tooltipContent={<CloudCoverTooltip series={CLOUD_COVER_SERIES} />}
        >
            {CLOUD_COVER_SERIES.map((series) => (
                <Area
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    name={series.label}
                    stackId="cloud-cover"
                    stroke={series.color}
                    strokeWidth={1.5}
                    fill={series.fill}
                    fillOpacity={0.9}
                    dot={false}
                    activeDot={{
                        r: 3.5,
                        fill: series.color,
                        stroke: "#ffffff",
                        strokeWidth: 1.5,
                    }}
                    isAnimationActive={false}
                />
            ))}
        </ClimateChart>
    );
}

export default CloudCoverChart;
