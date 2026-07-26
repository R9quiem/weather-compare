import DashboardGrid from "../../components/DashboardGrid/DashboardGrid.jsx";

import styles from "./WeatherComparePage.module.css";

function CompareDashboard({ children }) {
    return (
        <div className={styles.page}>
            <DashboardGrid className={styles.compareGrid}>{children}</DashboardGrid>
        </div>
    );
}

export default CompareDashboard;
