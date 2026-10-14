import type { ChartTooltipProps, ChartPoint } from "../../../types/charts.ts";
import { formatWindDate } from "./windUtils.ts";
import { useTranslation } from "react-i18next";
import styles from "./WindChart.module.css";
import { useMeasurementFormatter } from "../../../units/useMeasurementFormatter.ts";

function WindTooltip({ active, label, payload }: ChartTooltipProps<ChartPoint>) {
    const { t } = useTranslation();
    const { formatWind } = useMeasurementFormatter();
    if (!active) {
        return null;
    }

    const point = payload?.find((entry) => entry.payload?.observed_date)?.payload;

    if (!point) {
        return null;
    }

    return (
        <div className={styles.tooltip}>
            <p className={styles.tooltipDate}>
                {formatWindDate(String(label ?? point.observed_date), point._isMonthlyAggregate)}
            </p>
            <span className={styles.tooltipLabel}>{t("charts.averageWind")}</span>
            <strong className={styles.tooltipValue}>{formatWind(point.wind_speed_10m_mean)}</strong>
            <small className={styles.tooltipMeta}>{t("charts.atTenMetres")}</small>
        </div>
    );
}

export default WindTooltip;
