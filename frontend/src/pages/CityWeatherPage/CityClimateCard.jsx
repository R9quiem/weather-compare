import CitySelect from "../../components/CitySelect/CitySelect.jsx";
import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";

import styles from "./CityWeatherPage.module.css";

function CityClimateCard({
    cities,
    currentCity,
    currentCityId,
    setCurrentCityId,
    isCitiesLoading,
    error,
}) {
    return (
        <DashboardCard className={styles.select}>
            <div className={styles.cityHeader}>
                <p className={styles.cityEyebrow}>Климат города</p>

                <h2 className={styles.cityTitle}>
                    {currentCity?.name ?? "Выберите город"}
                </h2>

                <p className={styles.cityMeta}>
                    {currentCity?.country_code ?? "—"} · норма 1995–2025
                </p>
            </div>

            <div className={styles.citySelect}>
                <span className={styles.citySelectLabel}>Сменить город</span>

                {!isCitiesLoading && !error && (
                    <CitySelect
                        cities={cities}
                        selectedCityId={currentCityId}
                        setSelectedCityId={setCurrentCityId}
                        placeholder="Выберите город"
                    />
                )}
            </div>

        </DashboardCard>
    );
}

export default CityClimateCard;
