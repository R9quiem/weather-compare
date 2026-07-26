import { useTranslation } from "react-i18next";
import { useUnits } from "./useUnits.js";

export function useMeasurementFormatter() {
    const { t } = useTranslation();
    const { units } = useUnits();
    const unitLabel = (metric) => t(`units.values.${units[metric]}`);

    function convertValue(metric, value, { delta = false } = {}) {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) return null;
        if (metric === "temperature" && units.temperature === "fahrenheit") {
            return delta ? numericValue * 1.8 : numericValue * 1.8 + 32;
        }
        if (metric === "precipitation" && units.precipitation === "in") return numericValue / 25.4;
        if (metric === "wind" && units.wind === "ms") return numericValue / 3.6;
        if (metric === "wind" && units.wind === "mph") return numericValue * 0.621371;
        return numericValue;
    }

    function format(metric, value, digits, options) {
        const converted = convertValue(metric, value, options);
        return converted === null ? "—" : `${converted.toFixed(digits)} ${unitLabel(metric)}`;
    }

    return {
        units,
        unitLabel,
        convertValue,
        formatTemperature: (value, { digits = 1, delta = false } = {}) =>
            format("temperature", value, digits, { delta }),
        formatPrecipitation: (value, { digits = units.precipitation === "in" ? 1 : 0 } = {}) =>
            format("precipitation", value, digits),
        formatWind: (value, { digits = 1 } = {}) => format("wind", value, digits),
    };
}
