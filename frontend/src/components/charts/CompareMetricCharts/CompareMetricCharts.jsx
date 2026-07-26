import { useMemo } from "react";
import {
    Bar,
    Line,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

import ClimateChart from "../ClimateChart/ClimateChart.jsx";
import { formatMonth } from "../ClimateChart/chartUtils.js";
import { formatHumidityDate } from "../HumidityChart/humidityUtils.js";
import { prepareMonthlyPrecipitation } from "../PrecipitationChart/precipitationUtils.js";
import styles from "./CompareMetricCharts.module.css";

const COLORS = { first: "#4f5fdb", second: "#e58b55" };
const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const DIRECTION_LABELS = { N: "С", NE: "СВ", E: "В", SE: "ЮВ", S: "Ю", SW: "ЮЗ", W: "З", NW: "СЗ" };
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const CLOUD_CATEGORIES = [
    { key: "Clear", label: "Ясно", fill: "#8ec5f4" },
    { key: "Partly", label: "Переменная облачность", fill: "#c9d1dc" },
    { key: "Cloudy", label: "Пасмурно", fill: "#687484" },
];

function mergeDaily(firstData, secondData, sourceKey) {
    const secondByDate = new Map(secondData.map((point) => [point.observed_date, point]));

    return firstData.flatMap((firstPoint) => {
        const secondPoint = secondByDate.get(firstPoint.observed_date);
        if (!secondPoint) return [];

        return [
            {
                observed_date: firstPoint.observed_date,
                firstValue: firstPoint[sourceKey],
                secondValue: secondPoint[sourceKey],
            },
        ];
    });
}

function getPositiveDomain(data, keys) {
    const maximum = Math.max(0, ...data.flatMap((point) => keys.map((key) => point[key] ?? 0)));
    return [0, Math.max(5, Math.ceil((maximum * 1.15) / 5) * 5)];
}

function ComparisonTooltip({ active, label, payload, series, formatter, monthly = false }) {
    if (!active) return null;
    const point = payload?.find((entry) => entry.payload?.observed_date)?.payload;
    if (!point) return null;

    return (
        <div className={styles.tooltip}>
            <p>{monthly ? formatMonth(label) : formatHumidityDate(label)}</p>
            {series.map((item) => (
                <div key={item.key} className={styles.tooltipRow}>
                    <i style={{ backgroundColor: item.color }} />
                    <span>{item.label}</span>
                    <strong>{formatter(point[item.key])}</strong>
                </div>
            ))}
        </div>
    );
}

function CompareLineChart({
    firstData,
    secondData,
    firstCityName,
    secondCityName,
    sourceKey,
    unit,
    yDomain,
    formatter,
}) {
    const data = useMemo(
        () => mergeDaily(firstData, secondData, sourceKey),
        [firstData, secondData, sourceKey]
    );
    const series = [
        { key: "firstValue", label: firstCityName, color: COLORS.first },
        { key: "secondValue", label: secondCityName, color: COLORS.second },
    ];
    const domain = yDomain ?? getPositiveDomain(data, ["firstValue", "secondValue"]);

    return (
        <ClimateChart
            data={data}
            yDomain={domain}
            height={470}
            unit={unit}
            tooltipContent={<ComparisonTooltip series={series} formatter={formatter} />}
        >
            {series.map((item) => (
                <Line
                    key={item.key}
                    type="monotone"
                    dataKey={item.key}
                    name={item.label}
                    stroke={item.color}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: item.color, stroke: "#fff", strokeWidth: 2 }}
                    isAnimationActive={false}
                />
            ))}
        </ClimateChart>
    );
}

export function CompareHumidityChart(props) {
    return (
        <CompareLineChart
            {...props}
            sourceKey="relative_humidity_2m_mean"
            unit="%"
            yDomain={[0, 100]}
            formatter={(value) => `${Number(value).toFixed(0)}%`}
        />
    );
}

export function CompareWindChart(props) {
    return (
        <CompareLineChart
            {...props}
            sourceKey="wind_speed_10m_mean"
            unit=" км/ч"
            formatter={(value) => `${Number(value).toFixed(1)} км/ч`}
        />
    );
}

export function ComparePrecipitationChart({
    firstData,
    secondData,
    firstCityName,
    secondCityName,
}) {
    const firstMonthly = useMemo(() => prepareMonthlyPrecipitation(firstData).data, [firstData]);
    const secondMonthly = useMemo(() => prepareMonthlyPrecipitation(secondData).data, [secondData]);
    const data = useMemo(
        () =>
            firstMonthly.map((point, index) => ({
                observed_date: point.observed_date,
                firstValue: point.precipitation,
                secondValue: secondMonthly[index]?.precipitation ?? null,
            })),
        [firstMonthly, secondMonthly]
    );
    const series = [
        { key: "firstValue", label: firstCityName, color: COLORS.first },
        { key: "secondValue", label: secondCityName, color: COLORS.second },
    ];

    return (
        <ClimateChart
            data={data}
            yDomain={getPositiveDomain(data, ["firstValue", "secondValue"])}
            height={470}
            unit="мм"
            timeScale="monthly"
            tooltipCursor={false}
            tooltipContent={
                <ComparisonTooltip
                    monthly
                    series={series}
                    formatter={(value) => `${Number(value).toFixed(0)} мм`}
                />
            }
        >
            <Bar
                dataKey="firstValue"
                name={firstCityName}
                fill={COLORS.first}
                barSize={22}
                radius={[6, 6, 2, 2]}
                isAnimationActive={false}
            />
            <Bar
                dataKey="secondValue"
                name={secondCityName}
                fill={COLORS.second}
                barSize={22}
                radius={[6, 6, 2, 2]}
                isAnimationActive={false}
            />
        </ClimateChart>
    );
}

function CloudComparisonTooltip({
    active,
    label,
    payload,
    firstCityName,
    secondCityName,
    cityPrefix,
}) {
    const point = payload?.find((entry) => entry.payload?.observed_date)?.payload;
    if (!active || !point) return null;

    const monthDays = MONTH_DAYS[Number(label.slice(0, 2)) - 1] ?? 30;
    const cities = [
        { prefix: "first", name: firstCityName, color: COLORS.first },
        { prefix: "second", name: secondCityName, color: COLORS.second },
    ].filter((city) => !cityPrefix || city.prefix === cityPrefix);

    return (
        <div className={styles.tooltip}>
            <p>{formatMonth(label)}</p>
            {cities.map((city) => (
                <div key={city.prefix} className={styles.cloudTooltipCity}>
                    <strong className={styles.cloudTooltipTitle}>
                        <i style={{ backgroundColor: city.color }} />
                        {city.name}
                    </strong>
                    {CLOUD_CATEGORIES.map((category) => {
                        const value = Number(point[`${city.prefix}${category.key}`]);
                        const days = Math.round((value / 100) * monthDays);

                        return (
                            <div key={category.key} className={styles.cloudTooltipRow}>
                                <span>{category.label}</span>
                                <strong>
                                    {value.toFixed(1)}% · ≈{days} дн.
                                </strong>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

function CloudBars({ prefix, cityName, cityColor, barSize = 18 }) {
    return CLOUD_CATEGORIES.map((category, index) => (
        <Bar
            key={`${prefix}${category.key}`}
            dataKey={`${prefix}${category.key}`}
            name={`${cityName} · ${category.label}`}
            stackId={prefix}
            fill={category.fill}
            stroke={cityColor}
            strokeWidth={1}
            barSize={barSize}
            radius={index === CLOUD_CATEGORIES.length - 1 ? [4, 4, 0, 0] : 0}
            isAnimationActive={false}
        />
    ));
}

export function CompareCloudCoverChart({ firstData, secondData, firstCityName, secondCityName }) {
    const secondByDate = new Map(secondData.map((point) => [point.observed_date, point]));
    const data = firstData.flatMap((firstPoint) => {
        const secondPoint = secondByDate.get(firstPoint.observed_date);
        if (!secondPoint) return [];
        return [
            {
                observed_date: firstPoint.observed_date,
                firstClear: firstPoint.clear,
                firstPartly: firstPoint.partly_cloudy,
                firstCloudy: firstPoint.cloudy,
                secondClear: secondPoint.clear,
                secondPartly: secondPoint.partly_cloudy,
                secondCloudy: secondPoint.cloudy,
            },
        ];
    });
    const cities = [
        { prefix: "first", name: firstCityName, color: COLORS.first },
        { prefix: "second", name: secondCityName, color: COLORS.second },
    ];

    return (
        <div>
            <div className={styles.cloudDesktop}>
                <div className={styles.cloudLegend}>
                    <div className={styles.cloudCategories}>
                        {CLOUD_CATEGORIES.map((category) => (
                            <span key={category.key}>
                                <i style={{ backgroundColor: category.fill }} />
                                {category.label}
                            </span>
                        ))}
                    </div>
                    <div className={styles.cloudCities}>
                        <span>
                            <i style={{ backgroundColor: COLORS.first }} />
                            Слева — {firstCityName}
                        </span>
                        <span>
                            <i style={{ backgroundColor: COLORS.second }} />
                            Справа — {secondCityName}
                        </span>
                    </div>
                </div>
                <ClimateChart
                    data={data}
                    yDomain={[0, 100]}
                    yTicks={[0, 25, 50, 75, 100]}
                    yTickFormatter={(value) => `${value}%`}
                    height={430}
                    timeScale="monthly"
                    tooltipCursor={{ fill: "rgba(102, 116, 132, 0.08)" }}
                    tooltipContent={
                        <CloudComparisonTooltip
                            firstCityName={firstCityName}
                            secondCityName={secondCityName}
                        />
                    }
                >
                    {cities.flatMap((city) => (
                        <CloudBars
                            key={city.prefix}
                            prefix={city.prefix}
                            cityName={city.name}
                            cityColor={city.color}
                        />
                    ))}
                </ClimateChart>
            </div>
        </div>
    );
}

function WindRoseTooltip({ active, payload, firstCityName, secondCityName }) {
    const point = payload?.[0]?.payload;
    if (!active || !point) return null;

    return (
        <div className={styles.tooltip}>
            <p>{point.label}</p>
            <div className={styles.tooltipRow}>
                <i style={{ backgroundColor: COLORS.first }} />
                <span>{firstCityName}</span>
                <strong>{point.firstValue.toFixed(1)}%</strong>
            </div>
            <div className={styles.tooltipRow}>
                <i style={{ backgroundColor: COLORS.second }} />
                <span>{secondCityName}</span>
                <strong>{point.secondValue.toFixed(1)}%</strong>
            </div>
        </div>
    );
}

export function CompareWindRoseChart({ firstData, secondData, firstCityName, secondCityName }) {
    const firstByDirection = new Map(firstData.map((point) => [point.direction, point]));
    const secondByDirection = new Map(secondData.map((point) => [point.direction, point]));
    const data = DIRECTIONS.map((direction) => ({
        direction,
        label: DIRECTION_LABELS[direction],
        firstValue: firstByDirection.get(direction)?.frequency ?? 0,
        secondValue: secondByDirection.get(direction)?.frequency ?? 0,
    }));
    const maximum = Math.max(10, ...data.flatMap((point) => [point.firstValue, point.secondValue]));
    const domainMaximum = Math.ceil(maximum / 5) * 5;

    return (
        <div className={styles.rose} role="img" aria-label="Сравнение роз ветров двух городов">
            <ResponsiveContainer width="100%" height={470}>
                <RadarChart data={data} outerRadius="72%">
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
                        content={
                            <WindRoseTooltip
                                firstCityName={firstCityName}
                                secondCityName={secondCityName}
                            />
                        }
                        cursor={false}
                        isAnimationActive={false}
                    />
                    <Radar
                        dataKey="firstValue"
                        name={firstCityName}
                        stroke={COLORS.first}
                        strokeWidth={2.5}
                        fill={COLORS.first}
                        fillOpacity={0.14}
                        isAnimationActive={false}
                    />
                    <Radar
                        dataKey="secondValue"
                        name={secondCityName}
                        stroke={COLORS.second}
                        strokeWidth={2.5}
                        fill={COLORS.second}
                        fillOpacity={0.12}
                        isAnimationActive={false}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
