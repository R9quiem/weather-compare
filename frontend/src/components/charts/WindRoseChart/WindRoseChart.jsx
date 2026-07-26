import { useMemo } from "react";
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

const DIRECTION_LABELS = {
    N: "С",
    NE: "СВ",
    E: "В",
    SE: "ЮВ",
    S: "Ю",
    SW: "ЮЗ",
    W: "З",
    NW: "СЗ",
};

function WindRoseTooltip({ active, payload }) {
    const sector = payload?.[0]?.payload;

    if (!active || !sector) {
        return null;
    }

    return (
        <div className={styles.tooltip}>
            <strong>{sector.label}</strong>
            <span>{sector.frequency.toFixed(1)}% наблюдений</span>
            <small>
                Средняя скорость{" "}
                {sector.average_speed == null ? "—" : `${sector.average_speed.toFixed(1)} км/ч`}
            </small>
        </div>
    );
}

function WindRoseChart({ data }) {
    const chartData = useMemo(
        () =>
            data.map((sector) => ({
                ...sector,
                label: DIRECTION_LABELS[sector.direction],
            })),
        [data]
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
        <div
            className={styles.chart}
            role="img"
            aria-label="Роза ветров: частота направлений ветра за весь период"
        >
            {dominantSector && (
                <div className={styles.dominant}>
                    <span>Преобладает</span>
                    <strong>
                        {dominantSector.label} · {dominantSector.frequency.toFixed(1)}%
                    </strong>
                </div>
            )}

            <ResponsiveContainer width="100%" height={334}>
                <RadarChart data={chartData} outerRadius="72%">
                    <PolarGrid stroke="#dfe3e9" radialLines />
                    <PolarAngleAxis
                        dataKey="label"
                        tick={{ fill: "#5f6875", fontSize: 12, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, domainMaximum]}
                        tick={{ fill: "#8e97a1", fontSize: 10 }}
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
                        name="Частота"
                        stroke="#5277ad"
                        strokeWidth={2.4}
                        fill="#6f91c2"
                        fillOpacity={0.25}
                        dot={{ r: 3, fill: "#5277ad", strokeWidth: 0 }}
                        activeDot={{ r: 4, fill: "#5277ad", stroke: "#fff", strokeWidth: 2 }}
                        isAnimationActive={false}
                    />
                </RadarChart>
            </ResponsiveContainer>
            <p className={styles.explanation}>
                Каждая ось показывает, откуда приходит ветер: чем дальше контур от центра, тем чаще
                ветер дует с этой стороны.
            </p>
        </div>
    );
}

export default WindRoseChart;
