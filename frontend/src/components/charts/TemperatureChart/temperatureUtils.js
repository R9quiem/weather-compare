import i18n from "../../../i18n.js";

export function formatDate(date, short = false) {
    const [month, day] = date.split("-").map(Number);
    const formatter = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? "ru", {
        day: "numeric",
        month: short ? "short" : "long",
    });

    return formatter.format(new Date(2000, month - 1, day));
}

export function formatTemperature(value) {
    if (value == null) {
        return "—";
    }

    const temperature = Number(value);

    return `${temperature > 0 ? "+" : ""}${temperature.toFixed(1)}°`;
}

export function addTemperatureRange(
    data,
    {
        minKey = "temperature_2m_min",
        maxKey = "temperature_2m_max",
        rangeKey = "temperatureRange",
    } = {}
) {
    return data.map((point) => ({
        ...point,
        [rangeKey]: [point[minKey], point[maxKey]],
    }));
}

export function getTemperatureDomain(data, series, padding = 2) {
    if (data.length === 0) {
        return [0, 0];
    }

    const minimum = Math.min(...series.flatMap(({ minKey }) => data.map((point) => point[minKey])));
    const maximum = Math.max(...series.flatMap(({ maxKey }) => data.map((point) => point[maxKey])));

    return [Math.floor(minimum - padding), Math.ceil(maximum + padding)];
}

export function getTemperatureExtremes(
    data,
    { minKey = "temperature_2m_min", maxKey = "temperature_2m_max" } = {}
) {
    if (data.length === 0) {
        return null;
    }

    return data.reduce(
        (result, point) => ({
            min: point[minKey] < result.min[minKey] ? point : result.min,
            max: point[maxKey] > result.max[maxKey] ? point : result.max,
        }),
        { min: data[0], max: data[0] }
    );
}
