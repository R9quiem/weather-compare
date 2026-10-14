import type { DailyWeather, DailyNumericKey } from "../../../types/weather.ts";
import type { ChartPoint, TemperatureSeriesConfig, NumericDomain } from "../../../types/charts.ts";
import type { MeasurementValue } from "../../../types/preferences.ts";
import i18n from "../../../i18n.ts";

export function formatDate(date: string, short = false, monthly = false) {
    const [month, day] = date.split("-").map(Number);
    const formatter = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? "ru", {
        day: monthly ? undefined : "numeric",
        month: short ? "short" : "long",
    });

    return formatter.format(new Date(2000, month - 1, day));
}

export function formatTemperature(value: MeasurementValue) {
    if (value == null) {
        return "—";
    }

    const temperature = Number(value);

    return `${temperature > 0 ? "+" : ""}${temperature.toFixed(1)}°`;
}

export function addTemperatureRange(
    data: DailyWeather[],
    {
        minKey = "temperature_2m_min",
        maxKey = "temperature_2m_max",
        rangeKey = "temperatureRange",
    }: { minKey?: DailyNumericKey; maxKey?: DailyNumericKey; rangeKey?: string } = {}
): ChartPoint[] {
    return data.map((point) => ({
        ...point,
        [rangeKey]: [point[minKey], point[maxKey]],
    }));
}

export function getTemperatureDomain(
    data: ChartPoint[],
    series: TemperatureSeriesConfig[],
    padding = 2
): NumericDomain {
    if (data.length === 0) {
        return [0, 0];
    }

    const minimum = Math.min(
        ...series.flatMap(({ minKey }) => data.map((point) => Number(point[minKey])))
    );
    const maximum = Math.max(
        ...series.flatMap(({ maxKey }) => data.map((point) => Number(point[maxKey])))
    );

    return [Math.floor(minimum - padding), Math.ceil(maximum + padding)];
}

export function getTemperatureExtremes(
    data: ChartPoint[],
    { minKey = "temperature_2m_min", maxKey = "temperature_2m_max" } = {}
) {
    if (data.length === 0) {
        return null;
    }

    return data.reduce(
        (result, point) => ({
            min: Number(point[minKey]) < Number(result.min[minKey]) ? point : result.min,
            max: Number(point[maxKey]) > Number(result.max[maxKey]) ? point : result.max,
        }),
        { min: data[0], max: data[0] }
    );
}
