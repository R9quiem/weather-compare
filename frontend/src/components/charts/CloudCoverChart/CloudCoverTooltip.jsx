import { formatMonth } from "../ClimateChart/chartUtils.js";
import styles from "./CloudCoverChart.module.css";

function CloudCoverTooltip({ active, label, payload, series }) {
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

            {series.map((item) => (
                <div key={item.key} className={styles.tooltipRow}>
                    <span className={styles.tooltipDot} style={{ backgroundColor: item.color }} />
                    <span className={styles.tooltipLabel}>{item.label}</span>
                    <strong className={styles.tooltipValue}>{point[item.key].toFixed(1)}%</strong>
                </div>
            ))}
        </div>
    );
}

export default CloudCoverTooltip;
