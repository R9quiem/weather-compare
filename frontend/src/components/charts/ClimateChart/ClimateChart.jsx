import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    CartesianGrid,
    ComposedChart,
    Legend,
    ReferenceArea,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    COMPACT_MONTH_TICKS,
    aggregateDailyDataByMonth,
    formatMonth,
    MONTH_EDGES,
    MONTH_TICKS,
    MONTH_ZONES,
} from "./chartUtils.js";
import useMediaQuery from "../../../hooks/useMediaQuery.js";
import styles from "./ClimateChart.module.css";

function ClimateChart({
    data,
    children,
    tooltipContent,
    yDomain = ["auto", "auto"],
    height = 360,
    unit,
    yTicks,
    yTickFormatter,
    showLegend = false,
    timeScale = "daily",
    tooltipCursor,
    aggregateOnCompact = true,
}) {
    const { i18n } = useTranslation();
    const [hoveredMonth, setHoveredMonth] = useState(null);
    const isCompact = useMediaQuery("(max-width: 600px)");
    const shouldAggregate = isCompact && timeScale === "daily" && aggregateOnCompact;
    const chartData = useMemo(
        () => (shouldAggregate ? aggregateDailyDataByMonth(data) : data),
        [data, shouldAggregate]
    );
    const [yMin, yMax] = yDomain;
    const hasNumericDomain = Number.isFinite(yMin) && Number.isFinite(yMax);
    const monthEdgeHeight = hasNumericDomain ? (yMax - yMin) * 0.025 : 0;
    const showDailyMonthStructure = timeScale === "daily" && !shouldAggregate;
    const defaultTooltipCursor = {
        stroke: "var(--chart-secondary)",
        strokeWidth: 1,
        strokeDasharray: "3 4",
    };

    function handleMouseMove(chartState) {
        const date = chartState?.activeLabel;

        if (typeof date !== "string") {
            return;
        }

        const nextMonth = date.slice(0, 2);

        setHoveredMonth((currentMonth) => (currentMonth === nextMonth ? currentMonth : nextMonth));
    }

    return (
        <div className={styles.chart} style={{ height }}>
            <ResponsiveContainer>
                <ComposedChart
                    data={chartData}
                    margin={
                        isCompact
                            ? { top: 20, right: 6, bottom: 14, left: 0 }
                            : { top: 30, right: 30, bottom: 20, left: 10 }
                    }
                    onMouseMove={showDailyMonthStructure ? handleMouseMove : undefined}
                    onMouseLeave={showDailyMonthStructure ? () => setHoveredMonth(null) : undefined}
                >
                    {showDailyMonthStructure &&
                        MONTH_ZONES.map((month) => (
                            <ReferenceArea
                                key={month.key}
                                x1={month.start}
                                x2={month.end}
                                y1={hasNumericDomain ? yMin : undefined}
                                y2={hasNumericDomain ? yMax : undefined}
                                fill="var(--chart-label)"
                                fillOpacity={hoveredMonth === month.key ? 0.08 : 0}
                                stroke="none"
                                style={{ pointerEvents: "none" }}
                            />
                        ))}

                    <CartesianGrid
                        vertical={false}
                        stroke="var(--chart-grid)"
                        strokeDasharray="3 3"
                    />

                    <XAxis
                        dataKey="observed_date"
                        ticks={isCompact ? COMPACT_MONTH_TICKS : MONTH_TICKS}
                        tickFormatter={(date) =>
                            formatMonth(date, i18n.resolvedLanguage, isCompact)
                        }
                        interval={0}
                        tickLine={false}
                        tick={{ fontSize: isCompact ? 9 : 10, fill: "var(--chart-label)" }}
                        tickMargin={10}
                    />

                    <YAxis
                        domain={yDomain}
                        unit={unit}
                        ticks={yTicks}
                        width={isCompact ? 42 : 60}
                        tickFormatter={yTickFormatter}
                        tick={{ fontSize: 12, fill: "var(--chart-axis)" }}
                        tickMargin={10}
                    />

                    {tooltipContent && (
                        <Tooltip
                            cursor={tooltipCursor ?? defaultTooltipCursor}
                            content={tooltipContent}
                            isAnimationActive={false}
                        />
                    )}

                    {showLegend && <Legend />}

                    {children}

                    {showDailyMonthStructure &&
                        hasNumericDomain &&
                        MONTH_EDGES.map((date) => (
                            <ReferenceLine
                                key={date}
                                segment={[
                                    { x: date, y: yMin },
                                    { x: date, y: yMin + monthEdgeHeight },
                                ]}
                                stroke="var(--chart-secondary)"
                                strokeWidth={1.2}
                            />
                        ))}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

export default ClimateChart;
