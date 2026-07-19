const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
});

export function formatHumidity(value) {
    if (value == null) {
        return "—";
    }

    return `${Number(value).toFixed(0)}%`;
}

export function formatHumidityDate(date) {
    const [month, day] = date.split("-").map(Number);

    return dateFormatter.format(new Date(2000, month - 1, day));
}

export function calculateAverageHumidity(data) {
    if (data.length === 0) {
        return null;
    }

    const total = data.reduce(
        (sum, point) => sum + point.relative_humidity_2m_mean,
        0,
    );

    return total / data.length;
}
