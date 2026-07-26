import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import ClimateChart from "./ClimateChart/ClimateChart.jsx";
import TemperatureSeries from "./TemperatureChart/TemperatureSeries.jsx";
import TemperatureTooltip from "./TemperatureChart/TemperatureTooltip.jsx";
import { getTemperatureDomain } from "./TemperatureChart/temperatureUtils.js";
import { useMeasurementFormatter } from "../../units/useMeasurementFormatter.js";

function mergeCityWeather(firstCityWeather, secondCityWeather) {
    const secondCityByDate = new Map(
        secondCityWeather.map((point) => [point.observed_date, point])
    );

    return firstCityWeather.flatMap((firstPoint) => {
        const secondPoint = secondCityByDate.get(firstPoint.observed_date);

        if (!secondPoint) {
            return [];
        }

        return [
            {
                observed_date: firstPoint.observed_date,
                firstCityMean: firstPoint.temperature_2m_mean,
                firstCityMin: firstPoint.temperature_2m_min,
                firstCityMax: firstPoint.temperature_2m_max,
                firstCityRange: [firstPoint.temperature_2m_min, firstPoint.temperature_2m_max],
                secondCityMean: secondPoint.temperature_2m_mean,
                secondCityMin: secondPoint.temperature_2m_min,
                secondCityMax: secondPoint.temperature_2m_max,
                secondCityRange: [secondPoint.temperature_2m_min, secondPoint.temperature_2m_max],
            },
        ];
    });
}

function CompareTemperatureChart({
    firstCityWeather,
    secondCityWeather,
    firstCityName,
    secondCityName,
}) {
    const { t } = useTranslation();
    const { convertValue, unitLabel } = useMeasurementFormatter();
    const chartData = useMemo(
        () => mergeCityWeather(firstCityWeather, secondCityWeather),
        [firstCityWeather, secondCityWeather]
    );

    const series = useMemo(
        () => [
            {
                id: "first-city",
                label: firstCityName,
                meanKey: "firstCityMean",
                minKey: "firstCityMin",
                maxKey: "firstCityMax",
                rangeKey: "firstCityRange",
                color: "var(--color-accent-primary)",
            },
            {
                id: "second-city",
                label: secondCityName,
                meanKey: "secondCityMean",
                minKey: "secondCityMin",
                maxKey: "secondCityMax",
                rangeKey: "secondCityRange",
                color: "var(--color-accent-secondary)",
            },
        ],
        [firstCityName, secondCityName]
    );

    const yDomain = useMemo(() => getTemperatureDomain(chartData, series), [chartData, series]);

    if (chartData.length === 0) {
        return <p>{t("compare.chooseTwoCities")}</p>;
    }

    return (
        <div style={{ width: "100%" }}>
            <ClimateChart
                data={chartData}
                yDomain={yDomain}
                height={470}
                yTickFormatter={(value) => `${convertValue("temperature", value).toFixed(0)} ${unitLabel("temperature")}`}
                tooltipContent={<TemperatureTooltip series={series} />}
            >
                {series.map((item) => (
                    <TemperatureSeries key={item.id} {...item} />
                ))}
            </ClimateChart>
        </div>
    );
}

export default CompareTemperatureChart;
