import { useId } from "react";
import { Bar, ReferenceLine } from "recharts";
import { useTranslation } from "react-i18next";

function PrecipitationSeries({
    dataKey = "precipitation",
    monthlyAverage,
    color = "var(--color-accent-primary)",
}) {
    const { t } = useTranslation();
    const reactId = useId().replaceAll(":", "");
    const gradientId = `precipitation-bars-${reactId}`;

    return (
        <>
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.96} />
                    <stop offset="100%" stopColor="var(--color-accent-primary)" stopOpacity={0.9} />
                </linearGradient>
            </defs>

            <ReferenceLine
                y={monthlyAverage}
                stroke="var(--chart-secondary)"
                strokeWidth={1}
                strokeDasharray="4 4"
            />

            <Bar
                dataKey={dataKey}
                name={t("charts.averagePrecipitation")}
                barSize={30}
                radius={[8, 8, 2, 2]}
                fill={`url(#${gradientId})`}
                activeBar={{ fill: "var(--color-accent-primary-strong)" }}
                isAnimationActive={false}
            />
        </>
    );
}

export default PrecipitationSeries;
