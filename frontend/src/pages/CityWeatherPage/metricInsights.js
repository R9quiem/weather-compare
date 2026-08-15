import { getMonthName } from "../../utils/localization.js";

const WIND_ANGLES = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };

const SEASONS = [
    { key: "winter", months: [11, 0, 1] },
    { key: "spring", months: [2, 3, 4] },
    { key: "summer", months: [5, 6, 7] },
    { key: "autumn", months: [8, 9, 10] },
];

function average(values) {
    const presentValues = values.filter(Number.isFinite);
    if (!presentValues.length) return null;
    return presentValues.reduce((sum, value) => sum + value, 0) / presentValues.length;
}

function formatNumber(value, digits = 0) {
    return Number.isFinite(value) ? value.toFixed(digits) : "вЂ”";
}

function groupByMonth(data, key, operation = "average") {
    const months = Array.from({ length: 12 }, () => []);

    data.forEach((point) => {
        const monthIndex = Number(point.observed_date?.slice(0, 2)) - 1;
        const value = point[key];

        if (monthIndex >= 0 && monthIndex < 12 && Number.isFinite(value)) {
            months[monthIndex].push(value);
        }
    });

    return months.map((values, index) => ({
        monthIndex: index,
        value:
            operation === "sum" ? values.reduce((sum, value) => sum + value, 0) : average(values),
    }));
}

function findExtreme(values, direction) {
    const presentValues = values.filter((item) => Number.isFinite(item.value));
    if (!presentValues.length) return null;

    return presentValues.reduce((result, item) =>
        direction === "max"
            ? item.value > result.value
                ? item
                : result
            : item.value < result.value
              ? item
              : result
    );
}

export function calculateApparentTemperature({
    temperature_2m_mean: temperature,
    relative_humidity_2m_mean: humidity,
    wind_speed_10m_mean: windSpeed,
}) {
    if (![temperature, humidity, windSpeed].every(Number.isFinite)) return null;

    const waterVapourPressure =
        (humidity / 100) * 6.105 * Math.exp((17.27 * temperature) / (237.7 + temperature));
    const windSpeedMetresPerSecond = windSpeed / 3.6;

    return temperature + 0.33 * waterVapourPressure - 0.7 * windSpeedMetresPerSecond - 4;
}

export function addApparentTemperature(data) {
    return data.map((point) => ({
        ...point,
        apparent_temperature_mean: Number.isFinite(point.apparent_temperature_mean)
            ? point.apparent_temperature_mean
            : calculateApparentTemperature(point),
    }));
}

function temperatureInsight(t, dailyWeather, formatter) {
    const actual = average(dailyWeather.map((point) => point.temperature_2m_mean));
    const apparent = average(dailyWeather.map((point) => point.apparent_temperature_mean));
    const monthly = groupByMonth(dailyWeather, "temperature_2m_mean");
    const coldest = findExtreme(monthly, "min");
    const warmest = findExtreme(monthly, "max");
    const difference =
        Number.isFinite(apparent) && Number.isFinite(actual) ? apparent - actual : null;

    return {
        variant: "temperature",
        eyebrow: t("cityPage.insight.temperature.eyebrow"),
        title: t("cityPage.insight.temperature.title"),
        value: formatter.formatTemperature(actual),
        detail: t("cityPage.insight.temperature.detail"),
        secondary: [
            {
                label: t("cityPage.insight.temperature.coldest"),
                value: getMonthName(t, coldest?.monthIndex),
                detail: formatter.formatTemperature(coldest?.value),
            },
            {
                label: t("cityPage.insight.temperature.warmest"),
                value: getMonthName(t, warmest?.monthIndex),
                detail: formatter.formatTemperature(warmest?.value),
            },
        ],
        visual: {
            apparent: formatter.formatTemperature(apparent),
            difference: Number.isFinite(difference)
                ? t("cityPage.insight.temperature.difference", {
                      value: formatter.formatTemperature(Math.abs(difference), { delta: true }),
                      position: t(
                          difference <= 0
                              ? "cityPage.insight.temperature.below"
                              : "cityPage.insight.temperature.above"
                      ),
                  })
                : t("cityPage.insight.temperature.apparentFallback"),
        },
    };
}

function precipitationInsight(t, dailyWeather, formatter) {
    const monthly = groupByMonth(dailyWeather, "precipitation_sum", "sum");
    const wettest = findExtreme(monthly, "max");
    const driest = findExtreme(monthly, "min");
    const annual = monthly.reduce((sum, item) => sum + (item.value ?? 0), 0);
    const seasonTotals = SEASONS.map((season) => ({
        key: season.key,
        value: season.months.reduce((sum, index) => sum + (monthly[index].value ?? 0), 0),
    }));
    const dominantSeason = findExtreme(seasonTotals, "max");
    const seasonShare = annual ? (dominantSeason.value / annual) * 100 : null;

    return {
        variant: "precipitation",
        eyebrow: t("cityPage.insight.precipitation.eyebrow"),
        title: t("cityPage.insight.precipitation.title"),
        value: formatter.formatPrecipitation(annual),
        detail: t("cityPage.insight.precipitation.detail"),
        secondary: [
            {
                label: t("cityPage.insight.precipitation.maximum"),
                value: getMonthName(t, wettest?.monthIndex),
                detail: formatter.formatPrecipitation(wettest?.value),
            },
            {
                label: t("cityPage.insight.precipitation.minimum"),
                value: getMonthName(t, driest?.monthIndex),
                detail: formatter.formatPrecipitation(driest?.value),
            },
        ],
        visual: {
            season: dominantSeason ? t(`seasons.${dominantSeason.key}`) : "вЂ”",
            share: Number.isFinite(seasonShare)
                ? t("cityPage.insight.precipitation.annualShare", {
                      value: seasonShare.toFixed(0),
                  })
                : t("common.noData"),
        },
    };
}

function humidityInsight(t, dailyWeather) {
    const monthly = groupByMonth(dailyWeather, "relative_humidity_2m_mean");
    const mostHumid = findExtreme(monthly, "max");
    const driest = findExtreme(monthly, "min");
    const annual = average(dailyWeather.map((point) => point.relative_humidity_2m_mean));
    const range =
        Number.isFinite(mostHumid?.value) && Number.isFinite(driest?.value)
            ? mostHumid.value - driest.value
            : null;

    return {
        variant: "humidity",
        eyebrow: t("cityPage.insight.humidity.eyebrow"),
        title: t("cityPage.insight.humidity.title"),
        value: `${formatNumber(range)}%`,
        detail: t("cityPage.insight.humidity.detail"),
        secondary: [
            {
                label: t("cityPage.insight.humidity.driest"),
                value: getMonthName(t, driest?.monthIndex),
                detail: `${formatNumber(driest?.value)}%`,
            },
            {
                label: t("cityPage.insight.humidity.mostHumid"),
                value: getMonthName(t, mostHumid?.monthIndex),
                detail: `${formatNumber(mostHumid?.value)}%`,
            },
        ],
        visual: {
            level: Math.round(annual ?? 0),
            caption: t("cityPage.insight.humidity.annual"),
        },
    };
}

function windInsight(t, dailyWeather, windRose, windView, formatter) {
    if (windView === "rose") {
        const prevailing = windRose.reduce(
            (result, sector) => (!result || sector.frequency > result.frequency ? sector : result),
            null
        );
        const rankedDirections = [...windRose].sort(
            (left, right) => right.frequency - left.frequency
        );
        const secondDirection = rankedDirections[1];

        return {
            variant: "wind",
            eyebrow: t("cityPage.insight.windRose.eyebrow"),
            title: t("cityPage.insight.windRose.title"),
            value: prevailing ? t(`directions.${prevailing.direction}`) : "вЂ”",
            detail: prevailing
                ? t("cityPage.insight.windRose.frequency", {
                      value: prevailing.frequency.toFixed(1),
                  })
                : t("cityPage.insight.windRose.distribution"),
            secondary: [
                {
                    label: t("cityPage.insight.windRose.second"),
                    value: secondDirection ? t(`directions.${secondDirection.direction}`) : "вЂ”",
                    detail: secondDirection ? `${secondDirection.frequency.toFixed(1)}%` : "вЂ”",
                },
                {
                    label: t("cityPage.insight.windRose.averageSpeed"),
                    value: prevailing ? formatter.formatWind(prevailing.average_speed) : "вЂ”",
                },
            ],
            visual: {
                mode: "rose",
                angle: WIND_ANGLES[prevailing?.direction] ?? 0,
            },
        };
    }

    const monthly = groupByMonth(dailyWeather, "wind_speed_10m_mean");
    const windiest = findExtreme(monthly, "max");
    const calmest = findExtreme(monthly, "min");
    const annual = average(dailyWeather.map((point) => point.wind_speed_10m_mean));
    const variability =
        Number.isFinite(windiest?.value) && Number.isFinite(calmest?.value)
            ? windiest.value - calmest.value
            : null;
    const variabilityRatio = Number.isFinite(variability) && annual ? variability / annual : null;
    const variabilityLabel =
        variabilityRatio == null
            ? t("common.noData")
            : variabilityRatio < 0.15
              ? t("cityPage.insight.windSpeed.low")
              : variabilityRatio < 0.3
                ? t("cityPage.insight.windSpeed.moderate")
                : t("cityPage.insight.windSpeed.high");

    return {
        variant: "wind",
        eyebrow: t("cityPage.insight.windSpeed.eyebrow"),
        title: t("cityPage.insight.windSpeed.title"),
        value: formatter.formatWind(annual),
        detail: t("cityPage.insight.windSpeed.detail"),
        secondary: [
            {
                label: t("cityPage.insight.windSpeed.windiest"),
                value: getMonthName(t, windiest?.monthIndex),
                detail: formatter.formatWind(windiest?.value),
            },
            {
                label: t("cityPage.insight.windSpeed.calmest"),
                value: getMonthName(t, calmest?.monthIndex),
                detail: formatter.formatWind(calmest?.value),
            },
        ],
        visual: {
            mode: "speed",
            range: formatter.formatWind(variability),
            category: variabilityLabel,
        },
    };
}

function cloudInsight(t, cloudCover) {
    const values = [
        {
            name: t("cityPage.insight.cloud.clear"),
            shortLabel: t("cityPage.insight.cloud.clearShort"),
            value: average(cloudCover.map((point) => point.clear)),
            color: "var(--chart-cloud-clear)",
        },
        {
            name: t("cityPage.insight.cloud.partly"),
            shortLabel: t("cityPage.insight.cloud.partlyShort"),
            value: average(cloudCover.map((point) => point.partly_cloudy)),
            color: "var(--chart-cloud-partly)",
        },
        {
            name: t("cityPage.insight.cloud.cloudy"),
            shortLabel: t("cityPage.insight.cloud.cloudyShort"),
            value: average(cloudCover.map((point) => point.cloudy)),
            color: "var(--chart-cloud-overcast)",
        },
    ];
    const dominant = findExtreme(values, "max");
    const clear = values[0].value;
    const cloudy = values[2].value;
    const extremesShare = (clear ?? 0) + (cloudy ?? 0);
    const contrast = Math.abs((clear ?? 0) - (cloudy ?? 0));

    return {
        variant: "cloud",
        eyebrow: t("cityPage.insight.cloud.eyebrow"),
        title: dominant
            ? t("cityPage.insight.cloud.dominant", {
                  state: dominant.name.toLowerCase(),
                  value: formatNumber(dominant.value),
              })
            : t("cityPage.insight.cloud.dominantEmpty"),
        value: null,
        detail: t("cityPage.insight.cloud.detail"),
        secondary: [
            {
                label: t("cityPage.insight.cloud.clearVsCloudy"),
                value: `${formatNumber(contrast)}%`,
                detail: t(
                    clear >= cloudy
                        ? "cityPage.insight.cloud.moreClear"
                        : "cityPage.insight.cloud.moreCloudy"
                ),
            },
            {
                label: t("cityPage.insight.cloud.extremes"),
                value: `${formatNumber(extremesShare)}%`,
                detail: t("cityPage.insight.cloud.extremesDetail"),
            },
        ],
        visual: { segments: values },
    };
}

export function getMetricInsight(
    t,
    metric,
    dailyWeather,
    windRose,
    cloudCover,
    windView,
    formatter
) {
    if (!dailyWeather.length && metric !== "cloud") return null;

    switch (metric) {
        case "temperature":
            return temperatureInsight(t, dailyWeather, formatter);
        case "precipitation":
            return precipitationInsight(t, dailyWeather, formatter);
        case "humidity":
            return humidityInsight(t, dailyWeather);
        case "wind":
            return windInsight(t, dailyWeather, windRose, windView, formatter);
        case "cloud":
            return cloudInsight(t, cloudCover);
        default:
            return null;
    }
}
