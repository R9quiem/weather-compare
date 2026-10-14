import type { City } from "../../types/weather.ts";
import CitySelect from "../CitySelect/CitySelect.tsx";
import { useTranslation } from "react-i18next";
import styles from "./CompareCityPicker.module.css";

interface CompareCityPickerProps {
    side: string;
    accent: string;
    cities: City[];
    city: City | undefined;
    selectedCityId: number | null;
    setSelectedCityId: (id: number | null) => void;
    disabledCityId?: number | null;
    isLoading: boolean;
}

function CompareCityPicker({
    side,
    accent,
    cities,
    city,
    selectedCityId,
    setSelectedCityId,
    disabledCityId,
    isLoading,
}: CompareCityPickerProps) {
    const { t } = useTranslation();
    const role = t(side === "01" ? "compare.firstCity" : "compare.secondCity");

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
                placeholder={isLoading ? t("common.loading") : t("common.chooseCity")}
                isLoading={isLoading}
                ariaLabel={t("compare.selectCity", { side })}
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
