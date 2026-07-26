import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";

import styles from "./WeatherComparePage.module.css";

function CompareStats({ summary }) {
    const leaderRgb =
        summary.leaderSide === "first"
            ? "79, 95, 219"
            : summary.leaderSide === "second"
              ? "229, 139, 85"
              : "142, 151, 165";
    const differenceOpacity =
        summary.leaderSide === "neutral" ? 0.04 : 0.06 + summary.differenceIntensity * 0.2;
    const leaderStyle = {
        borderColor: `rgba(${leaderRgb}, 0.18)`,
        background: `linear-gradient(105deg, #ffffff 50%, rgba(${leaderRgb}, 0.11))`,
    };
    const differenceStyle = {
        borderColor: `rgba(${leaderRgb}, ${differenceOpacity.toFixed(3)})`,
        background: `linear-gradient(105deg, #ffffff 38%, rgba(${leaderRgb}, ${differenceOpacity.toFixed(3)}))`,
    };

    return (
        <div className={styles.summary} role="region" aria-label="Основные результаты сравнения">
            <DashboardCard className={styles.summaryItem}>
                <span>Период наблюдений</span>
                <strong>1995–2025</strong>
            </DashboardCard>
            <DashboardCard
                className={`${styles.summaryItem} ${styles.summaryLeader}`}
                style={leaderStyle}
            >
                <span>{summary.leaderLabel}</span>
                <strong>{summary.leaderName}</strong>
            </DashboardCard>
            <DashboardCard
                className={`${styles.summaryItem} ${styles.summaryDifference}`}
                style={differenceStyle}
            >
                <span>{summary.differenceLabel}</span>
                <strong>{summary.difference}</strong>
            </DashboardCard>
        </div>
    );
}

export default CompareStats;
