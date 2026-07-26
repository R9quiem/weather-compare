import { Area } from "recharts";
import { useTranslation } from "react-i18next";

import ClimateChart from "../ClimateChart/ClimateChart.jsx";
import CloudCoverTooltip from "./CloudCoverTooltip.jsx";

const CLOUD_COVER_SERIES = [
    {
        key: "clear",
        labelKey: "clearDays",
        color: "var(--chart-cloud-outline)",
        fill: "var(--chart-cloud-clear)",
    },
    {
        key: "partly_cloudy",
        labelKey: "partlyCloudy",
        color: "var(--chart-cloud-outline)",
        fill: "var(--chart-cloud-partly)",
    },
    {
        key: "cloudy",
        labelKey: "cloudyDays",
        color: "var(--chart-cloud-overcast)",
        fill: "var(--chart-cloud-overcast)",
    },
];

function CloudCoverChart({ data }) {
    const { t } = useTranslation();
    const seriesData = CLOUD_COVER_SERIES.map((series) => ({
        ...series,
        label: t(`charts.${series.labelKey}`),
    }));

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
            tooltipContent={<CloudCoverTooltip series={seriesData} />}
        >
            {seriesData.map((series) => (
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
                        stroke: "var(--color-white)",
                        strokeWidth: 1.5,
                    }}
                    isAnimationActive={false}
                />
            ))}
        </ClimateChart>
    );
}

export default CloudCoverChart;
