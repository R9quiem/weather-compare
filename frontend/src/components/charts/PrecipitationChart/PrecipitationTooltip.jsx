import { formatMonth } from "../ClimateChart/chartUtils.js";
import { useTranslation } from "react-i18next";
import styles from "./PrecipitationChart.module.css";
import { useMeasurementFormatter } from "../../../units/useMeasurementFormatter.js";

function PrecipitationTooltip({ active, label, payload }) {
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
            <p className={styles.tooltipMonth}>{formatMonth(label)}</p>
            <span className={styles.tooltipLabel}>{t("charts.averagePrecipitation")}</span>
            <strong className={styles.tooltipValue}>
                {formatPrecipitation(point.precipitation)}
            </strong>
        </div>
    );
}

export default PrecipitationTooltip;
