import type { TFunction } from "i18next";
import type { City } from "../types/weather.ts";

export const MONTH_KEYS = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
];

export function getCityName(t: TFunction, city: City | null | undefined, fallback = "—") {
    if (!city) return fallback;
    return t(`cities.${city.slug}`, { defaultValue: city.name || city.slug || fallback });
}

export function getMonthName(t: TFunction, monthIndex: number | undefined) {
    const monthKey = monthIndex === undefined ? undefined : MONTH_KEYS[monthIndex];
    return monthKey ? t(`months.${monthKey}`) : "—";
}
