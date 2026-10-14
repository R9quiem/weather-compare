import type { DailyWeather } from "../../../types/weather.ts";
import type { NumericDomain } from "../../../types/charts.ts";
import type { MeasurementValue } from "../../../types/preferences.ts";
import i18n from "../../../i18n.ts";
import { MONTH_ZONES } from "../ClimateChart/chartUtils.ts";

export function prepareMonthlyPrecipitation(dailyWeather: DailyWeather[]) {
    const monthlyTotals = Array<number>(12).fill(0);

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
        yDomain: [0, yMaximum] as NumericDomain,
    };
}

export function formatPrecipitation(value: MeasurementValue) {
    if (value == null) {
        return "—";
    }

    const digits = Number(value) >= 10 ? 0 : 1;

    return i18n.t("common.mm", { value: Number(value).toFixed(digits) });
}
