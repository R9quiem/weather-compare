export type ChartValue = string | number | boolean | null | undefined | (number | null)[];
export interface ChartPoint {
    observed_date: string;
    _isMonthlyAggregate?: boolean;
    [key: string]: ChartValue;
}

export interface ChartSeries {
    key: string;
    label: string;
    color: string;
}

export interface TemperatureSeriesConfig {
    id: string;
    label?: string;
    meanKey: string;
    minKey: string;
    maxKey: string;
    rangeKey: string;
    color?: string;
}

// Recharts injects these properties when it renders custom tooltip elements.
// Only the fields actually used by our tooltips are described here.
export interface ChartTooltipProps<T> {
    active?: boolean;
    label?: string | number;
    payload?: readonly { payload?: T }[];
}

export type NumericDomain = [number, number];
