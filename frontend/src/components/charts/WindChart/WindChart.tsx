import type { DailyWeather } from "../../../types/weather.ts";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ClimateChart from "../ClimateChart/ClimateChart.tsx";
import WindSeries from "./WindSeries.tsx";
import WindTooltip from "./WindTooltip.tsx";
import { calculateWindSummary } from "./windUtils.ts";
import styles from "./WindChart.module.css";
import { useMeasurementFormatter } from "../../../units/useMeasurementFormatter.ts";

interface WindChartProps {
    data: DailyWeather[];
}

function WindChart({ data }: WindChartProps) {
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
                yTickFormatter={(value) =>
                    `${(convertValue("wind", value) ?? NaN).toFixed(1)} ${unitLabel("wind")}`
                }
                tooltipContent={<WindTooltip />}
            >
                <WindSeries annualAverage={summary.annualAverage} />
            </ClimateChart>
        </div>
    );
}

export default WindChart;
