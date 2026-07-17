import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceArea,
    ReferenceDot,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {useState} from "react";

const SEASON_DATES = [
    "01-15",
    "04-15",
    "07-15",
    "10-15",
];

const SEASON_BORDERS = [
    "02-29",
    "05-31",
    "08-31",
    "11-30",
];

const SEASON_ZONES = [
    {
        key: "winter-start",
        season: "winter",
        x1: "01-01",
        x2: "02-29",
    },
    {
        key: "spring",
        season: "spring",
        x1: "03-01",
        x2: "05-31",
    },
    {
        key: "summer",
        season: "summer",
        x1: "06-01",
        x2: "08-31",
    },
    {
        key: "autumn",
        season: "autumn",
        x1: "09-01",
        x2: "11-30",
    },
    {
        key: "winter-end",
        season: "winter",
        x1: "12-01",
        x2: "12-31",
    },
];

function findSeasonZone(date) {
    return (
        SEASON_ZONES.find(
            (zone) =>
                date >= zone.x1 &&
                date <= zone.x2,
        )?.season ?? null
    );
}

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
});

function formatDate(date) {
    const [month, day] = date.split("-").map(Number);

    return dateFormatter.format(
        new Date(2000, month - 1, day),
    );
}

function formatTemperature(value) {
    const temperature = Number(value);

    return `${temperature > 0 ? "+" : ""}${temperature.toFixed(1)}°`;
}

function TemperatureLabel({viewBox, temperature}) {
    if (!viewBox) {
        return null;
    }

    const cx = viewBox.x + viewBox.width / 2;
    const cy = viewBox.y + viewBox.height / 2;

    return (
        <g pointerEvents="none">
            <rect
                x={cx - 24}
                y={cy - 26}
                width={48}
                height={18}
                rx={6}
                fill="#ffffff"
                stroke="#bbbdc8"
            />

            <text
                x={cx}
                y={cy - 17}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#060608"
                fontSize={10}
                fontWeight={650}
            >
                {formatTemperature(temperature)}
            </text>
        </g>
    );
}

function TemperatureChart({data}) {

    const [hoveredSeason, setHoveredSeason] = useState(null);

    function handleMouseMove(chartState) {
        const date = chartState?.activeLabel;

        if (typeof date !== "string") {
            setHoveredSeason(null);
            return;
        }

        setHoveredSeason(findSeasonZone(date));
    }

    const seasonalPoints = data.filter((item) =>
        SEASON_DATES.includes(item.observed_date),
    );

    const yMin =
        data.length > 0
            ? Math.floor(
                Math.min(
                    ...data.map(
                        (item) => item.temperature_2m_min,
                    ),
                ) - 2,
            )
            : 0;

    const yMax =
        data.length > 0
            ? Math.ceil(
                Math.max(
                    ...data.map(
                        (item) => item.temperature_2m_max,
                    ),
                ) + 2,
            )
            : 0;

    return (
        <div style={{width: "100%", height: 360}}>
            <ResponsiveContainer>
                <LineChart
                    data={data}
                    margin={{
                        top: 30,
                        right: 30,
                        left: 10,
                        bottom: 20,
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredSeason(null)}
                >
                    {SEASON_ZONES.map((zone) => {
                        const isHovered = hoveredSeason === zone.season;

                        return (
                            <ReferenceArea
                                key={zone.key}
                                x1={zone.x1}
                                x2={zone.x2}
                                y1={yMin}
                                y2={yMax}
                                fill="#8e97a1"
                                fillOpacity={isHovered ? 0.15 : 0}
                                stroke="none"
                                style={{
                                    pointerEvents: "none",
                                    transition: "fill-opacity 160ms ease",
                                }}
                            />
                        );
                    })}

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                    />

                    <XAxis
                        dataKey="observed_date"
                        ticks={SEASON_DATES}
                        tickFormatter={formatDate}
                        tick={{
                            fontSize: 10,
                            fill: "#8e97a1",
                        }}
                        tickMargin={10}
                    />
                    <YAxis
                        domain={[yMin, yMax]}
                        tick={{
                            fontSize: 12,
                            fill: "#6b7280",
                        }}
                        tickMargin={10}
                        unit="°C"
                    />

                    <Tooltip
                        formatter={(value) => [`${value} °C`, "Средняя температура"]}
                        labelFormatter={(label) => `Дата: ${label}`}
                    />
                    {seasonalPoints.map((point) => (
                        <ReferenceLine
                            key={`line-${point.observed_date}`}
                            segment={[
                                {
                                    x: point.observed_date,
                                    y: point.temperature_2m_mean,
                                },
                                {
                                    x: point.observed_date,
                                    y: yMin,
                                },
                            ]}
                            stroke="#bbbdc8"
                            strokeWidth={1}
                            strokeDasharray="3 4"
                        />
                    ))}
                    <Line
                        type="monotone"
                        dataKey="temperature_2m_mean"
                        stroke="#2563eb"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{r: 4}}
                        isAnimationActive={true}
                        animationDuration={700}
                        animationEasing="ease-in-out"
                    />

                    <Line
                        type="monotone"
                        dataKey="temperature_2m_max"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{r: 4}}
                        isAnimationActive={true}
                        animationDuration={700}
                        animationEasing="ease-in-out"
                    />
                    <Line
                        type="monotone"
                        dataKey="temperature_2m_min"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{r: 4}}
                        isAnimationActive={true}
                        animationDuration={700}
                        animationEasing="ease-in-out"
                    />
                    {seasonalPoints.map((point) => (
                        <ReferenceDot
                            key={`dot-${point.observed_date}`}
                            x={point.observed_date}
                            y={point.temperature_2m_mean}
                            r={3}
                            fill="#060608"
                            stroke="#ffffff"
                            strokeWidth={1.5}
                            label={
                                <TemperatureLabel
                                    temperature={point.temperature_2m_mean}
                                />
                            }
                        />
                    ))}
                    {SEASON_BORDERS.map((date) => (
                        <ReferenceLine
                            key={date}
                            x={date}
                            stroke="#bbbdc8"
                            strokeWidth={1}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default TemperatureChart;
