import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import ClimateChart from "../ClimateChart/ClimateChart.jsx";
import PrecipitationSeries from "./PrecipitationSeries.jsx";
import PrecipitationTooltip from "./PrecipitationTooltip.jsx";
import { prepareMonthlyPrecipitation } from "./precipitationUtils.js";
import styles from "./PrecipitationChart.module.css";
import { useMeasurementFormatter } from "../../../units/useMeasurementFormatter.js";

function PrecipitationChart({ data }) {
    const { t } = useTranslation();
    const { convertValue, formatPrecipitation, unitLabel } = useMeasurementFormatter();
    const precipitation = useMemo(() => prepareMonthlyPrecipitation(data), [data]);

    return (
        <div className={styles.chart}>
            {data.length > 0 && (
                <div className={styles.averageBadge}>
                    <span>{t("charts.monthlyAverage")}</span>
                    <strong>{formatPrecipitation(precipitation.monthlyAverage)}</strong>
                </div>
            )}

            <ClimateChart
                data={precipitation.data}
                yDomain={precipitation.yDomain}
                height={360}
                yTickFormatter={(value) =>
                    `${convertValue("precipitation", value).toFixed(1)} ${unitLabel("precipitation")}`
                }
                timeScale="monthly"
                tooltipCursor={false}
                tooltipContent={<PrecipitationTooltip />}
            >
                <PrecipitationSeries monthlyAverage={precipitation.monthlyAverage} />
            </ClimateChart>
        </div>
    );
}

export default PrecipitationChart;
