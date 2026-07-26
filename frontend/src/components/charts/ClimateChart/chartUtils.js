import i18n from "../../../i18n.js";

const MONTH_LAST_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const MONTH_ZONES = MONTH_LAST_DAYS.map((lastDay, index) => {
    const month = String(index + 1).padStart(2, "0");

    return {
        key: month,
        start: `${month}-01`,
        end: `${month}-${lastDay}`,
        labelDate: `${month}-15`,
    };
});

export const MONTH_TICKS = MONTH_ZONES.map((month) => month.labelDate);

export const MONTH_EDGES = [...MONTH_ZONES.map((month) => month.start), MONTH_ZONES.at(-1).end];

export function formatMonth(date, language = i18n.resolvedLanguage ?? "ru") {
    const month = Number(date.slice(0, 2));

    return new Intl.DateTimeFormat(language, {
        month: "short",
    }).format(new Date(2000, month - 1, 15));
}
