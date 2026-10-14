import type { ReactNode } from "react";
import DashboardGrid from "../../components/DashboardGrid/DashboardGrid.tsx";
import styles from "./WeatherComparePage.module.css";

interface CompareDashboardProps {
    children: ReactNode;
}

function CompareDashboard({ children }: CompareDashboardProps) {
    return (
        <div className={styles.page}>
            <DashboardGrid className={styles.compareGrid}>{children}</DashboardGrid>
        </div>
    );
}

export default CompareDashboard;
