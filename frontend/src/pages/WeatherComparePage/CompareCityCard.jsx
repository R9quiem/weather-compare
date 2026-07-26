import CompareCityPicker from "../../components/CompareCityPicker/CompareCityPicker.jsx";
import DashboardCard from "../../components/DashboardCard/DashboardCard.jsx";

import styles from "./WeatherComparePage.module.css";

function CompareCityCard({
    cities,
    firstCity,
    secondCity,
    firstCityId,
    secondCityId,
    setFirstCityId,
    setSecondCityId,
    isLoading,
    error,
}) {
    function swapCities() {
        setFirstCityId(secondCityId);
        setSecondCityId(firstCityId);
    }

    return (
        <DashboardCard className={styles.heroCard}>
            <header className={styles.intro}>
                <p className={styles.eyebrow}>Сравнение климата</p>
                <h1 className={styles.title}>Сравнение городов</h1>
            </header>

            {error && (
                <div className={styles.error} role="alert">
                    Не удалось загрузить данные: {error}
                </div>
            )}

            <div className={styles.duel} role="group" aria-label="Выбор городов для сравнения">
                <CompareCityPicker
                    side="01"
                    accent="blue"
                    cities={cities}
                    city={firstCity}
                    selectedCityId={firstCityId}
                    setSelectedCityId={setFirstCityId}
                    disabledCityId={secondCityId}
                    isLoading={isLoading}
                />

                <button
                    className={styles.swapButton}
                    type="button"
                    onClick={swapCities}
                    disabled={firstCityId == null || secondCityId == null}
                    aria-label="Поменять города местами"
                    title="Поменять города местами"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3" />
                    </svg>
                </button>

                <CompareCityPicker
                    side="02"
                    accent="orange"
                    cities={cities}
                    city={secondCity}
                    selectedCityId={secondCityId}
                    setSelectedCityId={setSecondCityId}
                    disabledCityId={firstCityId}
                    isLoading={isLoading}
                />
            </div>
        </DashboardCard>
    );
}

export default CompareCityCard;
