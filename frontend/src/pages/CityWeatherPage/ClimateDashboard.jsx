import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";
import DashboardGrid from "../../components/DashboardGrid/DashboardGrid.jsx";

import styles from "./CityWeatherPage.module.css";

function ClimateDashboard({children}) {
    return (
        <div className={styles.page}>
            <DashboardGrid>
                <DashboardCard className={styles.overview} variant="secondary">
                    <DashboardGrid className={styles.overviewGrid}>
                        {children}
                    </DashboardGrid>
                </DashboardCard>
            </DashboardGrid>
        </div>
    );
}

export default ClimateDashboard;
