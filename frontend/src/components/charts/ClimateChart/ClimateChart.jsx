import { useState } from "react";
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

import { formatMonth, MONTH_EDGES, MONTH_TICKS, MONTH_ZONES } from "./chartUtils.js";
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
}) {
    const [hoveredMonth, setHoveredMonth] = useState(null);
    const [yMin, yMax] = yDomain;
    const hasNumericDomain = Number.isFinite(yMin) && Number.isFinite(yMax);
    const monthEdgeHeight = hasNumericDomain ? (yMax - yMin) * 0.025 : 0;
    const showDailyMonthStructure = timeScale === "daily";
    const defaultTooltipCursor = {
        stroke: "#8f98a6",
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
                    data={data}
                    margin={{ top: 30, right: 30, bottom: 20, left: 10 }}
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
                                fill="#8e97a1"
                                fillOpacity={hoveredMonth === month.key ? 0.08 : 0}
                                stroke="none"
                                style={{ pointerEvents: "none" }}
                            />
                        ))}

                    <CartesianGrid vertical={false} stroke="#e7e9ed" strokeDasharray="3 3" />

                    <XAxis
                        dataKey="observed_date"
                        ticks={MONTH_TICKS}
                        tickFormatter={formatMonth}
                        interval={0}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#8e97a1" }}
                        tickMargin={10}
                    />

                    <YAxis
                        domain={yDomain}
                        unit={unit}
                        ticks={yTicks}
                        tickFormatter={yTickFormatter}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
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
                                stroke="#8f98a6"
                                strokeWidth={1.2}
                            />
                        ))}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

export default ClimateChart;
