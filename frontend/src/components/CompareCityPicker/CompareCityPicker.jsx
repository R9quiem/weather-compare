import CitySelect from "../CitySelect/CitySelect.jsx";

import styles from "./CompareCityPicker.module.css";

function CompareCityPicker({
    side,
    accent,
    cities,
    city,
    selectedCityId,
    setSelectedCityId,
    disabledCityId,
    isLoading,
}) {
    const role = side === "01" ? "Первый город" : "Второй город";

    return (
        <div className={`${styles.picker} ${styles[accent]}`}>
            <div className={styles.topline}>
                <span className={styles.side}>{side}</span>
                <span className={styles.role}>{role}</span>
            </div>

            <CitySelect
                cities={cities}
                selectedCityId={selectedCityId}
                setSelectedCityId={setSelectedCityId}
                disabledCityId={disabledCityId}
                placeholder={isLoading ? "Загрузка…" : "Выберите город"}
                isLoading={isLoading}
                ariaLabel={`Выбрать город ${side}`}
                classNames={{
                    trigger: styles.trigger,
                    value: styles.cityText,
                    icon: styles.chevron,
                    content: styles.content,
                    viewport: styles.viewport,
                    item: styles.item,
                    country: styles.country,
                }}
            />

            <div className={styles.meta}>
                <span>{city?.country_code ?? "—"}</span>
            </div>
        </div>
    );
}

export default CompareCityPicker;
