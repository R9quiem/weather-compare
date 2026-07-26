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

export function getCityName(t, city, fallback = "—") {
    if (!city) return fallback;
    return t(`cities.${city.slug}`, { defaultValue: city.name || city.slug || fallback });
}

export function getMonthName(t, monthIndex) {
    const monthKey = MONTH_KEYS[monthIndex];
    return monthKey ? t(`months.${monthKey}`) : "—";
}
