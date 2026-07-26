import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import ClimateChart from "../ClimateChart/ClimateChart.jsx";
import HumiditySeries from "./HumiditySeries.jsx";
import HumidityTooltip from "./HumidityTooltip.jsx";
import { calculateAverageHumidity, formatHumidity } from "./humidityUtils.js";
import styles from "./HumidityChart.module.css";

function HumidityChart({ data }) {
    const { t } = useTranslation();
    const averageHumidity = useMemo(() => calculateAverageHumidity(data), [data]);

    return (
        <div className={styles.chart}>
            {averageHumidity != null && (
                <div className={styles.averageBadge}>
                    <span>{t("charts.annualAverage")}</span>
                    <strong>{formatHumidity(averageHumidity)}</strong>
                </div>
            )}

            <ClimateChart
                data={data}
                yDomain={[0, 100]}
                height={360}
                unit="%"
                tooltipContent={<HumidityTooltip />}
            >
                <HumiditySeries averageHumidity={averageHumidity} />
            </ClimateChart>
        </div>
    );
}

export default HumidityChart;
