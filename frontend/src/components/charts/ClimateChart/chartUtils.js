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
export const COMPACT_MONTH_TICKS = MONTH_TICKS.filter((_, index) => index % 2 === 0);

export const MONTH_EDGES = [...MONTH_ZONES.map((month) => month.start), MONTH_ZONES.at(-1).end];

function average(values) {
    const present = values.filter(Number.isFinite);
    return present.length ? present.reduce((sum, value) => sum + value, 0) / present.length : null;
}

export function aggregateDailyDataByMonth(data) {
    const buckets = new Map();

    data.forEach((point) => {
        const month = point.observed_date?.slice(0, 2);
        if (!month) return;

        const bucket = buckets.get(month) ?? [];
        bucket.push(point);
        buckets.set(month, bucket);
    });

    return [...buckets.entries()].map(([month, points]) => {
        const keys = new Set(points.flatMap((point) => Object.keys(point)));
        const result = {
            observed_date: `${month}-15`,
            _isMonthlyAggregate: true,
        };

        keys.delete("observed_date");
        keys.delete("_isMonthlyAggregate");

        keys.forEach((key) => {
            const values = points.map((point) => point[key]);
            const arrayLength = Math.max(
                0,
                ...values.filter(Array.isArray).map((value) => value.length)
            );

            if (arrayLength) {
                result[key] = Array.from({ length: arrayLength }, (_, index) =>
                    average(values.map((value) => (Array.isArray(value) ? value[index] : null)))
                );
            } else if (values.some(Number.isFinite)) {
                result[key] = average(values);
            } else {
                result[key] = values.find((value) => value != null) ?? null;
            }
        });

        return result;
    });
}

export function formatMonth(date, language = i18n.resolvedLanguage ?? "ru", compact = false) {
    const month = Number(date.slice(0, 2));
    const label = new Intl.DateTimeFormat(language, {
        month: "short",
    }).format(new Date(2000, month - 1, 15));

    return compact ? label.replaceAll(".", "") : label;
}
