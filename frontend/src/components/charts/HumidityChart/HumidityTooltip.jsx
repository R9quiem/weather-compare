import {
    formatHumidity,
    formatHumidityDate,
} from "./humidityUtils.js";
import styles from "./HumidityChart.module.css";

function HumidityTooltip({active, label, payload}) {
    if (!active) {
        return null;
    }

    const point = payload?.find(
        (entry) => entry.payload?.observed_date,
    )?.payload;

    if (!point) {
        return null;
    }

    return (
        <div className={styles.tooltip}>
            <p className={styles.tooltipDate}>{formatHumidityDate(label)}</p>
            <span className={styles.tooltipLabel}>Средняя влажность</span>
            <strong className={styles.tooltipValue}>
                {formatHumidity(point.relative_humidity_2m_mean)}
            </strong>
        </div>
    );
}

export default HumidityTooltip;
