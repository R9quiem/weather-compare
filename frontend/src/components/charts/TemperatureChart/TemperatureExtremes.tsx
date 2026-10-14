import type { ChartPoint } from "../../../types/charts.ts";
import { ReferenceDot } from "recharts";
import { useTranslation } from "react-i18next";
import { formatDate } from "./temperatureUtils.ts";
import { useMeasurementFormatter } from "../../../units/useMeasurementFormatter.ts";

interface ExtremeLabelProps {
    viewBox?: { x: number; y: number; width: number; height: number };
    point: ChartPoint;
    kind: string;
    valueKey: string;
}
interface TemperatureExtremesProps {
    extremes: { min: ChartPoint; max: ChartPoint } | null;
    minKey?: string;
    maxKey?: string;
    color?: string;
}
function ExtremeLabel({ viewBox, point, kind, valueKey }: ExtremeLabelProps) {
    const { formatTemperature } = useMeasurementFormatter();
    if (!viewBox || !point) {
        return null;
    }

    const width = 88;
    const height = 34;
    const x = viewBox.x + viewBox.width / 2 - width / 2;
    const y = viewBox.y + viewBox.height / 2 - 42;

    return (
        <g pointerEvents="none">
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={9}
                fill="var(--color-surface)"
                stroke="var(--color-divider)"
            />
            <text
                x={x + width / 2}
                y={y + 13}
                textAnchor="middle"
                fill="var(--color-text-strong)"
                fontSize={10}
                fontWeight={650}
            >
                {kind} {formatTemperature(Number(point[valueKey]))}
            </text>
            <text
                x={x + width / 2}
                y={y + 26}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize={9}
            >
                {formatDate(point.observed_date, true, point._isMonthlyAggregate)}
            </text>
        </g>
    );
}

function TemperatureExtremes({
    extremes,
    minKey = "temperature_2m_min",
    maxKey = "temperature_2m_max",
    color = "var(--color-accent-primary)",
}: TemperatureExtremesProps) {
    const { t } = useTranslation();
    if (!extremes) {
        return null;
    }

    return (
        <>
            <ReferenceDot
                x={extremes.max.observed_date}
                y={Number(extremes.max[maxKey])}
                r={3.5}
                fill={color}
                stroke="var(--color-surface)"
                strokeWidth={1.5}
                label={
                    <ExtremeLabel
                        point={extremes.max}
                        kind={t("charts.maxShort")}
                        valueKey={maxKey}
                    />
                }
            />
            <ReferenceDot
                x={extremes.min.observed_date}
                y={Number(extremes.min[minKey])}
                r={3.5}
                fill={color}
                stroke="var(--color-surface)"
                strokeWidth={1.5}
                label={
                    <ExtremeLabel
                        point={extremes.min}
                        kind={t("charts.minShort")}
                        valueKey={minKey}
                    />
                }
            />
        </>
    );
}

export default TemperatureExtremes;
