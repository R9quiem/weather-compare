import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { useMeasurementFormatter } from "../../../units/useMeasurementFormatter.js";

const COLORS = { first: "var(--color-accent-primary)", second: "var(--color-accent-secondary)" };
const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const CLOUD_CATEGORIES = [
    { key: "Clear", labelKey: "clear", fill: "var(--chart-cloud-clear)" },
    { key: "Partly", labelKey: "partly", fill: "var(--chart-cloud-partly)" },
    { key: "Cloudy", labelKey: "cloudy", fill: "var(--chart-cloud-overcast)" },
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
    yTickFormatter,
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
            yTickFormatter={yTickFormatter}
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
                    activeDot={{ r: 4, fill: item.color, stroke: "var(--color-white)", strokeWidth: 2 }}
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
    const { convertValue, formatWind, unitLabel } = useMeasurementFormatter();
    return (
        <CompareLineChart
            {...props}
            sourceKey="wind_speed_10m_mean"
            yTickFormatter={(value) => `${convertValue("wind", value).toFixed(1)} ${unitLabel("wind")}`}
            formatter={formatWind}
        />
    );
}

export function ComparePrecipitationChart({
    firstData,
    secondData,
    firstCityName,
    secondCityName,
}) {
    const { convertValue, formatPrecipitation, unitLabel } = useMeasurementFormatter();
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
            yTickFormatter={(value) => `${convertValue("precipitation", value).toFixed(1)} ${unitLabel("precipitation")}`}
            timeScale="monthly"
            tooltipCursor={false}
            tooltipContent={
                <ComparisonTooltip
                    monthly
                    series={series}
                    formatter={formatPrecipitation}
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
    const { t } = useTranslation();
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
                                <span>{t(`charts.cloud.${category.labelKey}`)}</span>
                                <strong>
                                    {t("charts.approxDays", {
                                        value: value.toFixed(1),
                                        days,
                                    })}
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
    const { t } = useTranslation();
    return CLOUD_CATEGORIES.map((category, index) => (
        <Bar
            key={`${prefix}${category.key}`}
            dataKey={`${prefix}${category.key}`}
            name={`${cityName} В· ${t(`charts.cloud.${category.labelKey}`)}`}
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
    const { t } = useTranslation();
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
                                {t(`charts.cloud.${category.labelKey}`)}
                            </span>
                        ))}
                    </div>
                    <div className={styles.cloudCities}>
                        <span>
                            <i style={{ backgroundColor: COLORS.first }} />
                            {t("charts.leftCity", { city: firstCityName })}
                        </span>
                        <span>
                            <i style={{ backgroundColor: COLORS.second }} />
                            {t("charts.rightCity", { city: secondCityName })}
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
                    tooltipCursor={{ fill: "rgb(var(--rgb-muted) / 8%)" }}
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
    const { t } = useTranslation();
    const firstByDirection = new Map(firstData.map((point) => [point.direction, point]));
    const secondByDirection = new Map(secondData.map((point) => [point.direction, point]));
    const data = DIRECTIONS.map((direction) => ({
        direction,
        label: t(`directions.short.${direction}`),
        firstValue: firstByDirection.get(direction)?.frequency ?? 0,
        secondValue: secondByDirection.get(direction)?.frequency ?? 0,
    }));
    const maximum = Math.max(10, ...data.flatMap((point) => [point.firstValue, point.secondValue]));
    const domainMaximum = Math.ceil(maximum / 5) * 5;

    return (
        <div className={styles.rose} role="img" aria-label={t("charts.compareWindRoseAria")}>
            <ResponsiveContainer width="100%" height={470}>
                <RadarChart data={data} outerRadius="72%">
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
