const MONTH_NAMES = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
];

const WIND_DIRECTIONS = {
    N: "Северный",
    NE: "Северо-восточный",
    E: "Восточный",
    SE: "Юго-восточный",
    S: "Южный",
    SW: "Юго-западный",
    W: "Западный",
    NW: "Северо-западный",
};

const WIND_ANGLES = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };

const SEASONS = [
    { name: "Зима", months: [11, 0, 1] },
    { name: "Весна", months: [2, 3, 4] },
    { name: "Лето", months: [5, 6, 7] },
    { name: "Осень", months: [8, 9, 10] },
];

function average(values) {
    const presentValues = values.filter(Number.isFinite);
    if (!presentValues.length) return null;
    return presentValues.reduce((sum, value) => sum + value, 0) / presentValues.length;
}

function formatTemperature(value) {
    if (!Number.isFinite(value)) return "—";
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}°`;
}

function formatNumber(value, digits = 0) {
    return Number.isFinite(value) ? value.toFixed(digits) : "—";
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
        month: MONTH_NAMES[index],
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

function temperatureInsight(dailyWeather) {
    const actual = average(dailyWeather.map((point) => point.temperature_2m_mean));
    const apparent = average(dailyWeather.map((point) => point.apparent_temperature_mean));
    const monthly = groupByMonth(dailyWeather, "temperature_2m_mean");
    const coldest = findExtreme(monthly, "min");
    const warmest = findExtreme(monthly, "max");
    const difference =
        Number.isFinite(apparent) && Number.isFinite(actual) ? apparent - actual : null;

    return {
        variant: "temperature",
        eyebrow: "Температурный режим",
        title: "Средняя температура",
        value: formatTemperature(actual),
        detail: "Среднесуточная климатическая норма",
        secondary: [
            {
                label: "Самый холодный месяц",
                value: coldest?.month ?? "—",
                detail: formatTemperature(coldest?.value),
            },
            {
                label: "Самый тёплый месяц",
                value: warmest?.month ?? "—",
                detail: formatTemperature(warmest?.value),
            },
        ],
        visual: {
            apparent: formatTemperature(apparent),
            difference: Number.isFinite(difference)
                ? `${Math.abs(difference).toFixed(1)}° ${difference <= 0 ? "ниже" : "выше"} температуры воздуха`
                : "Учитывает влажность и ветер",
        },
    };
}

function precipitationInsight(dailyWeather) {
    const monthly = groupByMonth(dailyWeather, "precipitation_sum", "sum");
    const wettest = findExtreme(monthly, "max");
    const driest = findExtreme(monthly, "min");
    const annual = monthly.reduce((sum, item) => sum + (item.value ?? 0), 0);
    const seasonTotals = SEASONS.map((season) => ({
        name: season.name,
        value: season.months.reduce((sum, index) => sum + (monthly[index].value ?? 0), 0),
    }));
    const dominantSeason = findExtreme(seasonTotals, "max");
    const seasonShare = annual ? (dominantSeason.value / annual) * 100 : null;

    return {
        variant: "precipitation",
        eyebrow: "Режим осадков",
        title: "Годовая сумма",
        value: `${formatNumber(annual)} мм`,
        detail: "Средняя климатическая норма дождя и снега",
        secondary: [
            {
                label: "Максимум осадков",
                value: wettest?.month ?? "—",
                detail: `${formatNumber(wettest?.value)} мм`,
            },
            {
                label: "Минимум осадков",
                value: driest?.month ?? "—",
                detail: `${formatNumber(driest?.value)} мм`,
            },
        ],
        visual: {
            season: dominantSeason?.name ?? "—",
            share: Number.isFinite(seasonShare)
                ? `${seasonShare.toFixed(0)}% годовой суммы`
                : "Нет данных",
        },
    };
}

function humidityInsight(dailyWeather) {
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
        eyebrow: "Режим влажности",
        title: "Сезонный диапазон",
        value: `${formatNumber(range)}%`,
        detail: "Разница между крайними среднемесячными значениями",
        secondary: [
            {
                label: "Самый сухой месяц",
                value: driest?.month ?? "—",
                detail: `${formatNumber(driest?.value)}%`,
            },
            {
                label: "Самый влажный месяц",
                value: mostHumid?.month ?? "—",
                detail: `${formatNumber(mostHumid?.value)}%`,
            },
        ],
        visual: {
            level: Math.round(annual ?? 0),
            caption: "Средняя относительная влажность за год",
        },
    };
}

function windInsight(dailyWeather, windRose, windView) {
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
            eyebrow: "Направление ветра",
            title: "Преобладающее направление",
            value: WIND_DIRECTIONS[prevailing?.direction] ?? "—",
            detail: prevailing
                ? `${prevailing.frequency.toFixed(1)}% всех наблюдений`
                : "Распределение по направлениям",
            secondary: [
                {
                    label: "Второе по частоте",
                    value: WIND_DIRECTIONS[secondDirection?.direction] ?? "—",
                    detail: secondDirection ? `${secondDirection.frequency.toFixed(1)}%` : "—",
                },
                {
                    label: "Средняя скорость этого ветра",
                    value: prevailing ? `${formatNumber(prevailing.average_speed, 1)} км/ч` : "—",
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
            ? "Нет данных"
            : variabilityRatio < 0.15
              ? "Низкая"
              : variabilityRatio < 0.3
                ? "Умеренная"
                : "Высокая";

    return {
        variant: "wind",
        eyebrow: "Ветровой режим",
        title: "Средняя скорость ветра",
        value: `${formatNumber(annual, 1)} км/ч`,
        detail: "Среднесуточная скорость на высоте 10 м",
        secondary: [
            {
                label: "Наиболее ветреный месяц",
                value: windiest?.month ?? "—",
                detail: `${formatNumber(windiest?.value, 1)} км/ч`,
            },
            {
                label: "Наиболее спокойный месяц",
                value: calmest?.month ?? "—",
                detail: `${formatNumber(calmest?.value, 1)} км/ч`,
            },
        ],
        visual: {
            mode: "speed",
            range: `${formatNumber(variability, 1)} км/ч`,
            category: variabilityLabel,
        },
    };
}

function cloudInsight(cloudCover) {
    const values = [
        {
            name: "Ясное небо",
            shortLabel: "ясно",
            value: average(cloudCover.map((point) => point.clear)),
            color: "#8ec5f4",
        },
        {
            name: "Переменная облачность",
            shortLabel: "частично",
            value: average(cloudCover.map((point) => point.partly_cloudy)),
            color: "#c9d1dc",
        },
        {
            name: "Пасмурное небо",
            shortLabel: "пасмурно",
            value: average(cloudCover.map((point) => point.cloudy)),
            color: "#687484",
        },
    ];
    const dominant = findExtreme(values, "max");
    const clear = values[0].value;
    const cloudy = values[2].value;
    const extremesShare = (clear ?? 0) + (cloudy ?? 0);
    const contrast = Math.abs((clear ?? 0) - (cloudy ?? 0));

    return {
        variant: "cloud",
        eyebrow: "Режим облачности",
        title: dominant
            ? `Преобладает: ${dominant.name.toLowerCase()} — ${formatNumber(dominant.value)}%`
            : "Преобладающее состояние — нет данных",
        value: null,
        detail: "Средняя доля дней за год",
        secondary: [
            {
                label: "Ясно против пасмурно",
                value: `${formatNumber(contrast)}%`,
                detail: clear >= cloudy ? "чаще ясно" : "чаще пасмурно",
            },
            {
                label: "Крайние состояния",
                value: `${formatNumber(extremesShare)}%`,
                detail: "ясно или пасмурно",
            },
        ],
        visual: { segments: values },
    };
}

export function getMetricInsight(metric, dailyWeather, windRose, cloudCover, windView) {
    if (!dailyWeather.length && metric !== "cloud") return null;

    switch (metric) {
        case "temperature":
            return temperatureInsight(dailyWeather);
        case "precipitation":
            return precipitationInsight(dailyWeather);
        case "humidity":
            return humidityInsight(dailyWeather);
        case "wind":
            return windInsight(dailyWeather, windRose, windView);
        case "cloud":
            return cloudInsight(cloudCover);
        default:
            return null;
    }
}
