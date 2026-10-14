import type { DailyWeather } from "../../../types/weather.ts";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ClimateChart from "../ClimateChart/ClimateChart.tsx";
import HumiditySeries from "./HumiditySeries.tsx";
import HumidityTooltip from "./HumidityTooltip.tsx";
import { calculateAverageHumidity, formatHumidity } from "./humidityUtils.ts";
import styles from "./HumidityChart.module.css";

interface HumidityChartProps {
    data: DailyWeather[];
}

function HumidityChart({ data }: HumidityChartProps) {
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
