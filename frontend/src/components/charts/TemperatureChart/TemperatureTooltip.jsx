import styles from "./TemperatureChart.module.css";
import { formatDate } from "./temperatureUtils.js";
import { useTranslation } from "react-i18next";
import { useMeasurementFormatter } from "../../../units/useMeasurementFormatter.js";

function TemperatureTooltip({ active, label, payload, series, apparentTemperatureKey }) {
    const { t } = useTranslation();
    const { formatTemperature } = useMeasurementFormatter();
    if (!active) {
        return null;
    }

    const point = payload?.find((entry) => entry.payload?.observed_date)?.payload;

    if (!point) {
        return null;
    }

    const showSeriesNames = series.length > 1;

    return (
        <div className={styles.tooltip}>
            <p className={styles.tooltipDate}>
                {formatDate(label ?? point.observed_date, false, point._isMonthlyAggregate)}
            </p>

            {series.map((item, index) => (
                <div
                    key={item.id}
                    className={index > 0 ? styles.tooltipSeriesSeparated : undefined}
                >
                    {showSeriesNames && (
                        <div className={styles.tooltipSeriesName}>
                            <span
                                className={styles.tooltipSeriesDot}
                                style={{ backgroundColor: item.color }}
                            />
                            {item.label}
                        </div>
                    )}

                    <div className={`${styles.tooltipRow} ${styles.tooltipMean}`}>
                        <span>{t("charts.average")}</span>
                        <strong>{formatTemperature(point[item.meanKey])}</strong>
                    </div>

                    {apparentTemperatureKey && Number.isFinite(point[apparentTemperatureKey]) && (
                        <div className={`${styles.tooltipRow} ${styles.tooltipApparent}`}>
                            <span>{t("charts.apparent")}</span>
                            <strong>{formatTemperature(point[apparentTemperatureKey])}</strong>
                        </div>
                    )}

                    <div className={styles.tooltipRange}>
                        <div className={styles.tooltipRow}>
                            <span>{t("charts.minimum")}</span>
                            <strong>{formatTemperature(point[item.minKey])}</strong>
                        </div>
                        <div className={styles.tooltipRow}>
                            <span>{t("charts.maximum")}</span>
                            <strong>{formatTemperature(point[item.maxKey])}</strong>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default TemperatureTooltip;
