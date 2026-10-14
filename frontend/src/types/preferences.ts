import type { ReactNode } from "react";

export interface ProviderProps {
    children: ReactNode;
}
export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = Exclude<Theme, "system">;
export interface ThemeContextValue {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
}

export interface Units {
    temperature: "celsius" | "fahrenheit";
    precipitation: "mm" | "in";
    wind: "kmh" | "ms" | "mph";
}
export type UnitMetric = keyof Units;
export interface UnitsContextValue {
    units: Units;
    setUnit: (metric: UnitMetric, unit: string) => void;
}

export interface FormatOptions {
    digits?: number;
    delta?: boolean;
}
// Formatting functions accept unknown input and explicitly convert it with Number.
export type MeasurementValue = unknown;
export type MeasurementFormatter = (value: MeasurementValue, options?: FormatOptions) => string;
