import {formatMonth} from "../ClimateChart/chartUtils.js";
import {formatPrecipitation} from "./precipitationUtils.js";
import styles from "./PrecipitationChart.module.css";

function PrecipitationTooltip({active, label, payload}) {
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
            <p className={styles.tooltipMonth}>{formatMonth(label)}</p>
            <span className={styles.tooltipLabel}>Средние осадки</span>
            <strong className={styles.tooltipValue}>
                {formatPrecipitation(point.precipitation)}
            </strong>
        </div>
    );
}

export default PrecipitationTooltip;
