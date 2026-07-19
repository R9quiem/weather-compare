import styles from "./TemperatureChart.module.css";
import {formatDate, formatTemperature} from "./temperatureUtils.js";

function TemperatureTooltip({active, label, payload, series}) {
    if (!active) {
        return null;
    }

    const point = payload?.find(
        (entry) => entry.payload?.observed_date,
    )?.payload;

    if (!point) {
        return null;
    }

    const showSeriesNames = series.length > 1;

    return (
        <div className={styles.tooltip}>
            <p className={styles.tooltipDate}>
                {formatDate(label ?? point.observed_date)}
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
                                style={{backgroundColor: item.color}}
                            />
                            {item.label}
                        </div>
                    )}

                    <div className={`${styles.tooltipRow} ${styles.tooltipMean}`}>
                        <span>Средняя</span>
                        <strong>{formatTemperature(point[item.meanKey])}</strong>
                    </div>

                    <div className={styles.tooltipRange}>
                        <div className={styles.tooltipRow}>
                            <span>Минимум</span>
                            <strong>{formatTemperature(point[item.minKey])}</strong>
                        </div>
                        <div className={styles.tooltipRow}>
                            <span>Максимум</span>
                            <strong>{formatTemperature(point[item.maxKey])}</strong>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default TemperatureTooltip;
