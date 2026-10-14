import type { ChartTooltipProps, ChartPoint } from "../../../types/charts.ts";
import { formatMonth } from "../ClimateChart/chartUtils.ts";
import { useTranslation } from "react-i18next";
import styles from "./PrecipitationChart.module.css";
import { useMeasurementFormatter } from "../../../units/useMeasurementFormatter.ts";

function PrecipitationTooltip({ active, label, payload }: ChartTooltipProps<ChartPoint>) {
    const { t } = useTranslation();
    const { formatPrecipitation } = useMeasurementFormatter();
    if (!active) {
        return null;
    }

    const point = payload?.find((entry) => entry.payload?.observed_date)?.payload;

    if (!point) {
        return null;
    }

    return (
        <div className={styles.tooltip}>
            <p className={styles.tooltipMonth}>
                {formatMonth(String(label ?? point.observed_date))}
            </p>
            <span className={styles.tooltipLabel}>{t("charts.averagePrecipitation")}</span>
            <strong className={styles.tooltipValue}>
                {formatPrecipitation(point.precipitation)}
            </strong>
        </div>
    );
}

export default PrecipitationTooltip;
