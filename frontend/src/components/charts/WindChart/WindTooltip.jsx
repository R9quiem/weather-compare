import {formatWindDate, formatWindSpeed} from "./windUtils.js";
import styles from "./WindChart.module.css";

function WindTooltip({active, label, payload}) {
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
            <p className={styles.tooltipDate}>{formatWindDate(label)}</p>
            <span className={styles.tooltipLabel}>Средняя скорость</span>
            <strong className={styles.tooltipValue}>
                {formatWindSpeed(point.wind_speed_10m_mean)}
            </strong>
            <small className={styles.tooltipMeta}>На высоте 10 м</small>
        </div>
    );
}

export default WindTooltip;
