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

export function formatTemperature(value) {
    if (value == null) {
        return "—";
    }

    const sign = value > 0 ? "+" : "";

    return `${sign}${value.toFixed(1)}°`;
}

export function calculateClimateSummary(dailyWeather) {
    if (dailyWeather.length === 0) {
        return null;
    }

    const totals = dailyWeather.reduce(
        (result, day) => ({
            mean: result.mean + day.temperature_2m_mean,
            min: result.min + day.temperature_2m_min,
            max: result.max + day.temperature_2m_max,
            humidity: result.humidity + day.relative_humidity_2m_mean,
            windSpeed: result.windSpeed + day.wind_speed_10m_mean,
        }),
        {mean: 0, min: 0, max: 0, humidity: 0, windSpeed: 0},
    );

    const monthlyPrecipitation = Array(12).fill(0);

    dailyWeather.forEach((day) => {
        const monthIndex = Number(day.observed_date.slice(0, 2)) - 1;

        monthlyPrecipitation[monthIndex] += day.precipitation_sum ?? 0;
    });

    const wettestMonthIndex = monthlyPrecipitation.indexOf(
        Math.max(...monthlyPrecipitation),
    );

    return {
        annualMean: totals.mean / dailyWeather.length,
        annualMinMean: totals.min / dailyWeather.length,
        annualMaxMean: totals.max / dailyWeather.length,
        annualHumidity: totals.humidity / dailyWeather.length,
        annualWindSpeed: totals.windSpeed / dailyWeather.length,
        wettestMonth: MONTH_NAMES[wettestMonthIndex],
        wettestMonthPrecipitation: monthlyPrecipitation[wettestMonthIndex],
    };
}
