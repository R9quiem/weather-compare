import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

import styles from "./WindRoseChart.module.css";
import { useMeasurementFormatter } from "../../../units/useMeasurementFormatter.js";

function WindRoseTooltip({ active, payload }) {
    const { t } = useTranslation();
    const { formatWind } = useMeasurementFormatter();
    const sector = payload?.[0]?.payload;

    if (!active || !sector) {
        return null;
    }

    return (
        <div className={styles.tooltip}>
            <strong>{sector.label}</strong>
            <span>{t("charts.observations", { value: sector.frequency.toFixed(1) })}</span>
            <small>
                {t("charts.averageWind")}{" "}
                {sector.average_speed == null
                    ? "вЂ”"
                    : formatWind(sector.average_speed)}
            </small>
        </div>
    );
}

function WindRoseChart({ data }) {
    const { t } = useTranslation();
    const chartData = useMemo(
        () =>
            data.map((sector) => ({
                ...sector,
                label: t(`directions.short.${sector.direction}`),
            })),
        [data, t]
    );
    const dominantSector = useMemo(
        () =>
            chartData.reduce(
                (dominant, sector) =>
                    !dominant || sector.frequency > dominant.frequency ? sector : dominant,
                null
            ),
        [chartData]
    );
    const maximum = Math.max(10, ...chartData.map((sector) => sector.frequency));
    const domainMaximum = Math.ceil(maximum / 5) * 5;

    return (
        <div className={styles.chart} role="img" aria-label={t("charts.windRoseAria")}>
            {dominantSector && (
                <div className={styles.dominant}>
                    <span>{t("charts.prevailing")}</span>
                    <strong>
                        {dominantSector.label} В· {dominantSector.frequency.toFixed(1)}%
                    </strong>
                </div>
            )}

            <ResponsiveContainer width="100%" height={334}>
                <RadarChart data={chartData} outerRadius="72%">
                    <PolarGrid stroke="var(--chart-grid)" radialLines />
                    <PolarAngleAxis
                        dataKey="label"
                        tick={{ fill: "var(--chart-axis)", fontSize: 12, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, domainMaximum]}
                        tick={{ fill: "var(--chart-label)", fontSize: 10 }}
                        tickFormatter={(value) => `${value}%`}
                        axisLine={false}
                    />
                    <Tooltip
                        content={<WindRoseTooltip />}
                        cursor={false}
                        isAnimationActive={false}
                    />
                    <Radar
                        dataKey="frequency"
                        name={t("charts.frequency")}
                        stroke="var(--chart-wind)"
                        strokeWidth={2.4}
                        fill="var(--chart-wind)"
                        fillOpacity={0.25}
                        dot={{ r: 3, fill: "var(--chart-wind)", strokeWidth: 0 }}
                        activeDot={{ r: 4, fill: "var(--chart-wind)", stroke: "var(--color-white)", strokeWidth: 2 }}
                        isAnimationActive={false}
                    />
                </RadarChart>
            </ResponsiveContainer>
            <p className={styles.explanation}>{t("charts.windRoseDescription")}</p>
        </div>
    );
}

export default WindRoseChart;
