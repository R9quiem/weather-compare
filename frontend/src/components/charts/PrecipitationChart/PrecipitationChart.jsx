import {useMemo} from "react";

import ClimateChart from "../ClimateChart/ClimateChart.jsx";
import PrecipitationSeries from "./PrecipitationSeries.jsx";
import PrecipitationTooltip from "./PrecipitationTooltip.jsx";
import {
    formatPrecipitation,
    prepareMonthlyPrecipitation,
} from "./precipitationUtils.js";
import styles from "./PrecipitationChart.module.css";

function PrecipitationChart({data}) {
    const precipitation = useMemo(
        () => prepareMonthlyPrecipitation(data),
        [data],
    );

    return (
        <div className={styles.chart}>
            {data.length > 0 && (
                <div className={styles.averageBadge}>
                    <span>Среднее за месяц</span>
                    <strong>
                        {formatPrecipitation(precipitation.monthlyAverage)}
                    </strong>
                </div>
            )}

            <ClimateChart
                data={precipitation.data}
                yDomain={precipitation.yDomain}
                height={360}
                unit="мм"
                timeScale="monthly"
                tooltipCursor={false}
                tooltipContent={<PrecipitationTooltip/>}
            >
                <PrecipitationSeries
                    monthlyAverage={precipitation.monthlyAverage}
                />
            </ClimateChart>
        </div>
    );
}

export default PrecipitationChart;
