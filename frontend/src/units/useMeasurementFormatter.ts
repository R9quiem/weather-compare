import type { UnitMetric, MeasurementValue, FormatOptions } from "../types/preferences.ts";
import { isFiniteNumber } from "../utils/numbers.ts";
import { useTranslation } from "react-i18next";
import { useUnits } from "./useUnits.ts";

export function useMeasurementFormatter() {
    const { t } = useTranslation();
    const { units } = useUnits();
    const unitLabel = (metric: UnitMetric) => t(`units.values.${units[metric]}`);

    function convertValue(
        metric: UnitMetric,
        value: MeasurementValue,
        { delta = false }: FormatOptions = {}
    ) {
        const numericValue = Number(value);
        if (!isFiniteNumber(numericValue)) return null;
        if (metric === "temperature" && units.temperature === "fahrenheit") {
            return delta ? numericValue * 1.8 : numericValue * 1.8 + 32;
        }
        if (metric === "precipitation" && units.precipitation === "in") return numericValue / 25.4;
        if (metric === "wind" && units.wind === "ms") return numericValue / 3.6;
        if (metric === "wind" && units.wind === "mph") return numericValue * 0.621371;
        return numericValue;
    }

    function format(
        metric: UnitMetric,
        value: MeasurementValue,
        digits: number,
        options?: FormatOptions
    ) {
        const converted = convertValue(metric, value, options);
        return converted === null ? "—" : `${converted.toFixed(digits)} ${unitLabel(metric)}`;
    }

    return {
        units,
        unitLabel,
        convertValue,
        formatTemperature: (
            value: MeasurementValue,
            { digits = 1, delta = false }: FormatOptions = {}
        ) => format("temperature", value, digits, { delta }),
        formatPrecipitation: (
            value: MeasurementValue,
            { digits = units.precipitation === "in" ? 1 : 0 }: FormatOptions = {}
        ) => format("precipitation", value, digits),
        formatWind: (value: MeasurementValue, { digits = 1 }: FormatOptions = {}) =>
            format("wind", value, digits),
    };
}
