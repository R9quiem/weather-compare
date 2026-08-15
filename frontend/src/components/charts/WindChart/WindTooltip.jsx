import { formatWindDate } from "./windUtils.js";
import { useTranslation } from "react-i18next";
import styles from "./WindChart.module.css";
import { useMeasurementFormatter } from "../../../units/useMeasurementFormatter.js";

function WindTooltip({ active, label, payload }) {
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
            <p className={styles.tooltipDate}>{formatWindDate(label, point._isMonthlyAggregate)}</p>
            <span className={styles.tooltipLabel}>{t("charts.averageWind")}</span>
            <strong className={styles.tooltipValue}>{formatWind(point.wind_speed_10m_mean)}</strong>
            <small className={styles.tooltipMeta}>{t("charts.atTenMetres")}</small>
        </div>
    );
}

export default WindTooltip;
