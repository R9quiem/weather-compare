import type { ReactNode } from "react";
import DashboardCard from "../../components/DashboardCard/DashboardCard.tsx";
import DashboardGrid from "../../components/DashboardGrid/DashboardGrid.tsx";
import styles from "./CityWeatherPage.module.css";

interface ClimateDashboardProps {
    children: ReactNode;
}

function ClimateDashboard({ children }: ClimateDashboardProps) {
    return (
        <div className={styles.page}>
            <DashboardGrid>
                <DashboardCard className={styles.overview} variant="secondary">
                    <DashboardGrid className={styles.overviewGrid}>{children}</DashboardGrid>
                </DashboardCard>
            </DashboardGrid>
        </div>
    );
}

export default ClimateDashboard;
