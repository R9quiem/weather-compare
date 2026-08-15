import CitySelect from "../../components/CitySelect/CitySelect.jsx";
import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";
import { useTranslation } from "react-i18next";

import styles from "./CityWeatherPage.module.css";

function CityClimateCard({
    cities,
    currentCity,
    currentCityId,
    setCurrentCityId,
    isCitiesLoading,
    error,
}) {
    const { t } = useTranslation();

    return (
        <DashboardCard className={styles.select}>
            <div className={styles.cityHeader}>
                {!isCitiesLoading && !error ? (
                    <CitySelect
                        cities={cities}
                        selectedCityId={currentCityId}
                        setSelectedCityId={setCurrentCityId}
                        placeholder={t("common.chooseCity")}
                        ariaLabel={t("common.chooseCity")}
                    />
                ) : (
                    <h2 className={styles.cityTitle}>{t("common.chooseCity")}</h2>
                )}

                <div className={styles.cityMeta}>
                    <span className={styles.cityCountry}>{currentCity?.country_code ?? "—"}</span>
                    <span className={styles.cityPeriod}>{t("cityPage.period")}</span>
                </div>
            </div>
        </DashboardCard>
    );
}

export default CityClimateCard;
