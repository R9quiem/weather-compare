import i18n from "../../../i18n.js";
import { MONTH_ZONES } from "../ClimateChart/chartUtils.js";

export function prepareMonthlyPrecipitation(dailyWeather) {
    const monthlyTotals = Array(12).fill(0);

    dailyWeather.forEach((day) => {
        const monthIndex = Number(day.observed_date.slice(0, 2)) - 1;

        monthlyTotals[monthIndex] += day.precipitation_sum ?? 0;
    });

    const monthlyAverage =
        monthlyTotals.reduce((total, value) => total + value, 0) / monthlyTotals.length;

    const data = MONTH_ZONES.map((month, index) => ({
        observed_date: month.labelDate,
        monthKey: month.key,
        precipitation: monthlyTotals[index],
    }));

    const maximum = Math.max(...monthlyTotals, 0);
    const yMaximum = Math.max(10, Math.ceil((maximum * 1.15) / 10) * 10);

    return {
        data,
        monthlyAverage,
        yDomain: [0, yMaximum],
    };
}

export function formatPrecipitation(value) {
    if (value == null) {
        return "—";
    }

    const digits = value >= 10 ? 0 : 1;

    return i18n.t("common.mm", { value: Number(value).toFixed(digits) });
}
