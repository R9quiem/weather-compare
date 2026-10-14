import type { Units, UnitMetric, ProviderProps } from "../types/preferences.ts";
import { useMemo, useState } from "react";
import { UnitsContext } from "./unitsContext.ts";

const STORAGE_KEY = "weather-report-units";
const DEFAULT_UNITS: Units = { temperature: "celsius", precipitation: "mm", wind: "kmh" };
const VALID_UNITS: Record<UnitMetric, Set<string>> = {
    temperature: new Set(["celsius", "fahrenheit"]),
    precipitation: new Set(["mm", "in"]),
    wind: new Set(["kmh", "ms", "mph"]),
};

function readStoredUnits(): Units {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
        const stored =
            parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
        const temperature = stored.temperature;
        const precipitation = stored.precipitation;
        const wind = stored.wind;
        return {
            temperature:
                temperature === "celsius" || temperature === "fahrenheit"
                    ? temperature
                    : DEFAULT_UNITS.temperature,
            precipitation:
                precipitation === "mm" || precipitation === "in"
                    ? precipitation
                    : DEFAULT_UNITS.precipitation,
            wind: wind === "kmh" || wind === "ms" || wind === "mph" ? wind : DEFAULT_UNITS.wind,
        };
    } catch {
        return DEFAULT_UNITS;
    }
}

export function UnitProvider({ children }: ProviderProps) {
    const [units, setUnits] = useState(readStoredUnits);
    const value = useMemo(
        () => ({
            units,
            setUnit(metric: UnitMetric, unit: string) {
                if (!VALID_UNITS[metric]?.has(unit)) return;
                setUnits((current) => {
                    const next = { ...current, [metric]: unit };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                    return next;
                });
            },
        }),
        [units]
    );

    return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
}
