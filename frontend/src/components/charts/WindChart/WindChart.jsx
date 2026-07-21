import {useMemo} from "react";

import ClimateChart from "../ClimateChart/ClimateChart.jsx";
import WindSeries from "./WindSeries.jsx";
import WindTooltip from "./WindTooltip.jsx";
import {calculateWindSummary, formatWindSpeed} from "./windUtils.js";
import styles from "./WindChart.module.css";

function WindChart({data}) {
    const summary = useMemo(
        () => calculateWindSummary(data),
        [data],
    );

    return (
        <div className={styles.chart}>
            {summary.annualAverage != null && (
                <div className={styles.averageBadge}>
                    <span>Средняя за год</span>
                    <strong>{formatWindSpeed(summary.annualAverage)}</strong>
                </div>
            )}

            <ClimateChart
                data={data}
                yDomain={summary.yDomain}
                height={360}
                unit=" км/ч"
                tooltipContent={<WindTooltip/>}
            >
                <WindSeries annualAverage={summary.annualAverage}/>
            </ClimateChart>
        </div>
    );
}

export default WindChart;
