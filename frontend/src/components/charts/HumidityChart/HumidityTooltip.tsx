import type { ChartTooltipProps, ChartPoint } from "../../../types/charts.ts";
import { formatHumidity, formatHumidityDate } from "./humidityUtils.ts";
import { useTranslation } from "react-i18next";
import styles from "./HumidityChart.module.css";

function HumidityTooltip({ active, label, payload }: ChartTooltipProps<ChartPoint>) {
    const { t } = useTranslation();
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
                {formatHumidityDate(
                    String(label ?? point.observed_date),
                    point._isMonthlyAggregate
                )}
            </p>
            <span className={styles.tooltipLabel}>{t("charts.averageHumidity")}</span>
            <strong className={styles.tooltipValue}>
                {formatHumidity(point.relative_humidity_2m_mean)}
            </strong>
        </div>
    );
}

export default HumidityTooltip;
