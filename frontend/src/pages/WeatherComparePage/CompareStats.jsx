import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";
import { useTranslation } from "react-i18next";

import { getCityName } from "../../utils/localization.js";
import styles from "./WeatherComparePage.module.css";
import { useMeasurementFormatter } from "../../units/useMeasurementFormatter.js";

function CompareStats({ summary }) {
    const { t } = useTranslation();
    const { formatPrecipitation, formatTemperature, formatWind } = useMeasurementFormatter();
    const leaderColor =
        summary.leaderSide === "first"
            ? "var(--color-accent-primary)"
            : summary.leaderSide === "second"
              ? "var(--color-accent-secondary)"
              : "var(--color-text-subtle)";
    const resultStyle = {
        "--summary-accent": leaderColor,
    };
    const formattedDifference = (() => {
        if (summary.difference == null) return "—";
        if (summary.metric === "temperature")
            return formatTemperature(summary.difference, { delta: true });
        if (summary.metric === "precipitation") return formatPrecipitation(summary.difference);
        if (summary.metric === "wind") return formatWind(summary.difference);
        return t("common.percentagePoints", { value: summary.difference.toFixed(1) });
    })();
    const leaderName = summary.isTie ? t("compare.summary.tie") : getCityName(t, summary.leader);

    return (
        <>
            <DashboardCard className={styles.summaryItem} aria-label={t("compare.period")}>
                <span>{t("compare.period")}</span>
                <strong>1995–2025</strong>
            </DashboardCard>
            <DashboardCard
                className={styles.summaryResult}
                style={resultStyle}
                aria-label={t("compare.results")}
            >
                <div className={`${styles.summaryMetric} ${styles.summaryLeaderMetric}`}>
                    <span>{t(`compare.summary.${summary.leaderLabelKey}`)}</span>
                    <strong>{leaderName}</strong>
                </div>
                <div className={styles.summaryMetric}>
                    <span>{t(`compare.summary.${summary.differenceLabelKey}`)}</span>
                    <strong>{formattedDifference}</strong>
                </div>
            </DashboardCard>
        </>
    );
}

export default CompareStats;
