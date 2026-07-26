import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import ClimateChart from "../ClimateChart/ClimateChart.jsx";
import WindSeries from "./WindSeries.jsx";
import WindTooltip from "./WindTooltip.jsx";
import { calculateWindSummary } from "./windUtils.js";
import styles from "./WindChart.module.css";
import { useMeasurementFormatter } from "../../../units/useMeasurementFormatter.js";

function WindChart({ data }) {
    const { t } = useTranslation();
    const { convertValue, formatWind, unitLabel } = useMeasurementFormatter();
    const summary = useMemo(() => calculateWindSummary(data), [data]);

    return (
        <div className={styles.chart}>
            {summary.annualAverage != null && (
                <div className={styles.averageBadge}>
                    <span>{t("charts.annualAverage")}</span>
                    <strong>{formatWind(summary.annualAverage)}</strong>
                </div>
            )}

            <ClimateChart
                data={data}
                yDomain={summary.yDomain}
                height={360}
                yTickFormatter={(value) => `${convertValue("wind", value).toFixed(1)} ${unitLabel("wind")}`}
                tooltipContent={<WindTooltip />}
            >
                <WindSeries annualAverage={summary.annualAverage} />
            </ClimateChart>
        </div>
    );
}

export default WindChart;
