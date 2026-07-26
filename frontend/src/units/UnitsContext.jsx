import { useMemo, useState } from "react";
import { UnitsContext } from "./unitsContext.js";

const STORAGE_KEY = "weather-report-units";
const DEFAULT_UNITS = { temperature: "celsius", precipitation: "mm", wind: "kmh" };
const VALID_UNITS = {
    temperature: new Set(["celsius", "fahrenheit"]),
    precipitation: new Set(["mm", "in"]),
    wind: new Set(["kmh", "ms", "mph"]),
};

function readStoredUnits() {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Object.fromEntries(
            Object.entries(DEFAULT_UNITS).map(([metric, fallback]) => [
                metric,
                VALID_UNITS[metric].has(stored?.[metric]) ? stored[metric] : fallback,
            ])
        );
    } catch {
        return DEFAULT_UNITS;
    }
}

export function UnitProvider({ children }) {
    const [units, setUnits] = useState(readStoredUnits);
    const value = useMemo(
        () => ({
            units,
            setUnit(metric, unit) {
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
