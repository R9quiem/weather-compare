import i18n from "../../../i18n.js";

export function formatWindSpeed(value) {
    if (value == null) {
        return "—";
    }

    return i18n.t("common.kmh", { value: Number(value).toFixed(1) });
}

export function formatWindDate(date) {
    const [month, day] = date.split("-").map(Number);

    return new Intl.DateTimeFormat(i18n.resolvedLanguage ?? "ru", {
        day: "numeric",
        month: "long",
    }).format(new Date(2000, month - 1, day));
}

export function calculateWindSummary(data) {
    const speeds = data.map((point) => point.wind_speed_10m_mean).filter(Number.isFinite);

    if (speeds.length === 0) {
        return {
            annualAverage: null,
            yDomain: [0, 10],
        };
    }

    const annualAverage = speeds.reduce((total, speed) => total + speed, 0) / speeds.length;
    const maximum = Math.max(...speeds);
    const yMaximum = Math.max(10, Math.ceil((maximum * 1.15) / 5) * 5);

    return {
        annualAverage,
        yDomain: [0, yMaximum],
    };
}
