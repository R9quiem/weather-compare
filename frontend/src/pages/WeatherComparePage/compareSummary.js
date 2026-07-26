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
    let leaderLabelKey;
    let differenceLabelKey;

    if (metric === "temperature") {
        firstValue = average(firstWeather.data, "temperature_2m_mean");
        secondValue = average(secondWeather.data, "temperature_2m_mean");
        leaderLabelKey = "temperatureLeader";
        differenceLabelKey = "temperatureDifference";
    } else if (metric === "precipitation") {
        firstValue = total(firstWeather.data, "precipitation_sum");
        secondValue = total(secondWeather.data, "precipitation_sum");
        leaderLabelKey = "precipitationLeader";
        differenceLabelKey = "precipitationDifference";
    } else if (metric === "humidity") {
        firstValue = average(firstWeather.data, "relative_humidity_2m_mean");
        secondValue = average(secondWeather.data, "relative_humidity_2m_mean");
        leaderLabelKey = "humidityLeader";
        differenceLabelKey = "humidityDifference";
    } else if (metric === "wind") {
        firstValue = average(firstWeather.data, "wind_speed_10m_mean");
        secondValue = average(secondWeather.data, "wind_speed_10m_mean");
        leaderLabelKey = "windLeader";
        differenceLabelKey = "windDifference";
    } else {
        firstValue = average(firstWeather.cloudCover, "cloudy");
        secondValue = average(secondWeather.cloudCover, "cloudy");
        leaderLabelKey = "cloudLeader";
        differenceLabelKey = "cloudDifference";
    }

    const hasValues = Number.isFinite(firstValue) && Number.isFinite(secondValue);
    const difference = hasValues ? firstValue - secondValue : null;
    const isTie = difference != null && Math.abs(difference) < 0.05;
    const leader =
        difference == null ? null : isTie ? null : difference > 0 ? firstCity : secondCity;
    const differenceMagnitude = difference == null ? 0 : Math.abs(difference);

    return {
        metric,
        leaderLabelKey,
        differenceLabelKey,
        leader,
        isTie,
        difference: difference == null ? null : Math.abs(difference),
        leaderSide: difference == null || isTie ? "neutral" : difference > 0 ? "first" : "second",
        differenceIntensity: Math.min(differenceMagnitude / DIFFERENCE_SCALES[metric], 1),
    };
}
