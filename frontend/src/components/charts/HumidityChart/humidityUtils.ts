import type { DailyWeather } from "../../../types/weather.ts";
import type { MeasurementValue } from "../../../types/preferences.ts";
import i18n from "../../../i18n.ts";

export function formatHumidity(value: MeasurementValue) {
    if (value == null) {
        return "—";
    }

    return `${Number(value).toFixed(0)}%`;
}

export function formatHumidityDate(date: string, monthly = false) {
    const [month, day] = date.split("-").map(Number);

    return new Intl.DateTimeFormat(i18n.resolvedLanguage ?? "ru", {
        day: monthly ? undefined : "numeric",
        month: "long",
    }).format(new Date(2000, month - 1, day));
}

export function calculateAverageHumidity(data: DailyWeather[]) {
    if (data.length === 0) {
        return null;
    }

    const total = data.reduce((sum, point) => sum + Number(point.relative_humidity_2m_mean), 0);

    return total / data.length;
}
