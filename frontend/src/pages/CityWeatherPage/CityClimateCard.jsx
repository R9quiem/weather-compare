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

                {!isCitiesLoading && !error ? (
                    <CitySelect
                        cities={cities}
                        selectedCityId={currentCityId}
                        setSelectedCityId={setCurrentCityId}
                        placeholder="Выберите город"
                    />
                ) : (
                    <h2 className={styles.cityTitle}>Выберите город</h2>
                )}

                <div className={styles.cityMeta}>
                    <span className={styles.cityCountry}>{currentCity?.country_code ?? "—"}</span>
                    <span className={styles.cityPeriod}>Период наблюдений: 1995–2025</span>
                </div>
            </div>
        </DashboardCard>
    );
}

export default CityClimateCard;
