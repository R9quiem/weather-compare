function average(data, key) {
    const values = data.map((point) => point[key]).filter(Number.isFinite);
    if (!values.length) return null;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function total(data, key) {
    const values = data.map((point) => point[key]).filter(Number.isFinite);
    if (!values.length) return null;
    return values.reduce((sum, value) => sum + value, 0);
}

const DIFFERENCE_SCALES = {
    temperature: 8,
    precipitation: 500,
    humidity: 20,
    wind: 12,
    cloud: 30,
};

export function calculateComparisonSummary(
    metric,
    firstWeather,
    secondWeather,
    firstCity,
    secondCity
) {
    let firstValue;
    let secondValue;
    let leaderLabel;
    let differenceLabel;
    let formatter;

    if (metric === "temperature") {
        firstValue = average(firstWeather.data, "temperature_2m_mean");
        secondValue = average(secondWeather.data, "temperature_2m_mean");
        leaderLabel = "Выше средняя температура";
        differenceLabel = "Разница температур";
        formatter = (value) => `${value.toFixed(1)} °C`;
    } else if (metric === "precipitation") {
        firstValue = total(firstWeather.data, "precipitation_sum");
        secondValue = total(secondWeather.data, "precipitation_sum");
        leaderLabel = "Больше осадков за год";
        differenceLabel = "Разница осадков";
        formatter = (value) => `${value.toFixed(0)} мм`;
    } else if (metric === "humidity") {
        firstValue = average(firstWeather.data, "relative_humidity_2m_mean");
        secondValue = average(secondWeather.data, "relative_humidity_2m_mean");
        leaderLabel = "Выше средняя влажность";
        differenceLabel = "Разница влажности";
        formatter = (value) => `${value.toFixed(1)} п. п.`;
    } else if (metric === "wind") {
        firstValue = average(firstWeather.data, "wind_speed_10m_mean");
        secondValue = average(secondWeather.data, "wind_speed_10m_mean");
        leaderLabel = "Выше средняя скорость ветра";
        differenceLabel = "Разница скорости";
        formatter = (value) => `${value.toFixed(1)} км/ч`;
    } else {
        firstValue = average(firstWeather.cloudCover, "cloudy");
        secondValue = average(secondWeather.cloudCover, "cloudy");
        leaderLabel = "Выше доля пасмурных дней";
        differenceLabel = "Разница долей";
        formatter = (value) => `${value.toFixed(1)} п. п.`;
    }

    const hasValues = Number.isFinite(firstValue) && Number.isFinite(secondValue);
    const difference = hasValues ? firstValue - secondValue : null;
    const isTie = difference != null && Math.abs(difference) < 0.05;
    const leader =
        difference == null
            ? null
            : isTie
              ? { name: "Значения равны" }
              : difference > 0
                ? firstCity
                : secondCity;
    const differenceMagnitude = difference == null ? 0 : Math.abs(difference);

    return {
        leaderLabel,
        differenceLabel,
        leaderName: leader?.name ?? "—",
        difference: difference == null ? "—" : formatter(Math.abs(difference)),
        leaderSide: difference == null || isTie ? "neutral" : difference > 0 ? "first" : "second",
        differenceIntensity: Math.min(differenceMagnitude / DIFFERENCE_SCALES[metric], 1),
    };
}
