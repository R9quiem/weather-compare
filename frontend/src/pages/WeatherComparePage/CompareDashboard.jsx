import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";
import DashboardGrid from "../../components/DashboardGrid/DashboardGrid.jsx";

import styles from "./WeatherComparePage.module.css";

function CompareDashboard({ children }) {
    return (
        <div className={styles.page}>
            <DashboardGrid>
                <DashboardCard className={styles.overview} variant="secondary">
                    <DashboardGrid className={styles.compareGrid}>{children}</DashboardGrid>
                </DashboardCard>
            </DashboardGrid>
        </div>
    );
}

export default CompareDashboard;
