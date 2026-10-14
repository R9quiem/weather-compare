import type { DailyWeather } from "../../types/weather.ts";
import type { MeasurementValue } from "../../types/preferences.ts";
import { isFiniteNumber } from "../../utils/numbers.ts";

export function formatTemperature(value: MeasurementValue) {
    if (value == null) {
        return "—";
    }

    const sign = Number(value) > 0 ? "+" : "";

    return `${sign}${Number(value).toFixed(1)}°`;
}

export function calculateClimateSummary(dailyWeather: DailyWeather[]) {
    if (dailyWeather.length === 0) {
        return null;
    }

    const totals = dailyWeather.reduce(
        (result, day) => ({
            mean: result.mean + Number(day.temperature_2m_mean),
            min: result.min + Number(day.temperature_2m_min),
            max: result.max + Number(day.temperature_2m_max),
            humidity: result.humidity + Number(day.relative_humidity_2m_mean),
            windSpeed: result.windSpeed + Number(day.wind_speed_10m_mean),
        }),
        { mean: 0, min: 0, max: 0, humidity: 0, windSpeed: 0 }
    );

    const monthlyPrecipitation = Array<number>(12).fill(0);
    const monthlyHumidityTotals = Array<number>(12).fill(0);
    const monthlyHumidityCounts = Array<number>(12).fill(0);

    dailyWeather.forEach((day) => {
        const monthIndex = Number(day.observed_date.slice(0, 2)) - 1;

        monthlyPrecipitation[monthIndex] += day.precipitation_sum ?? 0;

        if (isFiniteNumber(day.relative_humidity_2m_mean)) {
            monthlyHumidityTotals[monthIndex] += day.relative_humidity_2m_mean;
            monthlyHumidityCounts[monthIndex] += 1;
        }
    });

    const monthlyHumidity = monthlyHumidityTotals
        .map((total, monthIndex) =>
            monthlyHumidityCounts[monthIndex] ? total / monthlyHumidityCounts[monthIndex] : null
        )
        .filter(isFiniteNumber);

    const wettestMonthIndex = monthlyPrecipitation.indexOf(Math.max(...monthlyPrecipitation));

    return {
        annualMean: totals.mean / dailyWeather.length,
        annualMinMean: totals.min / dailyWeather.length,
        annualMaxMean: totals.max / dailyWeather.length,
        annualHumidity: totals.humidity / dailyWeather.length,
        monthlyHumidityMin: monthlyHumidity.length ? Math.min(...monthlyHumidity) : null,
        monthlyHumidityMax: monthlyHumidity.length ? Math.max(...monthlyHumidity) : null,
        annualWindSpeed: totals.windSpeed / dailyWeather.length,
        annualPrecipitation: monthlyPrecipitation.reduce((sum, value) => sum + value, 0),
        wettestMonthIndex,
        wettestMonthPrecipitation: monthlyPrecipitation[wettestMonthIndex],
    };
}
