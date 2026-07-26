import { Select } from "radix-ui";
import { useTranslation } from "react-i18next";

import { getCityName } from "../../utils/localization.js";
import styles from "./CitySelect.module.css";

function CitySelect({
    cities,
    selectedCityId,
    setSelectedCityId,
    disabledCityId,
    placeholder,
    isLoading = false,
    ariaLabel,
    classNames = {},
}) {
    const { t } = useTranslation();
    const selectStyles = {
        trigger: classNames.trigger ?? styles["city-select-trigger"],
        value: classNames.value ?? styles["city-select-value"],
        icon: classNames.icon ?? styles["city-select-icon"],
        content: classNames.content ?? styles["city-select-content"],
        viewport: classNames.viewport ?? styles["city-select-viewport"],
        item: classNames.item ?? styles["city-select-item"],
        country: classNames.country ?? styles["city-select-country"],
    };

    return (
        <Select.Root
            value={selectedCityId == null ? "" : String(selectedCityId)}
            onValueChange={(newValue) => setSelectedCityId(Number(newValue))}
        >
            <Select.Trigger
                className={selectStyles.trigger}
                disabled={isLoading}
                aria-label={ariaLabel}
            >
                <span className={selectStyles.value}>
                    <Select.Value placeholder={placeholder} />
                </span>
                <Select.Icon className={selectStyles.icon}>
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                        <path d="m5 7.5 5 5 5-5" />
                    </svg>
                </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content
                    className={selectStyles.content}
                    align="start"
                    position="popper"
                    sideOffset={8}
                >
                    <Select.Viewport className={selectStyles.viewport}>
                        {cities.map((city) => (
                            <Select.Item
                                key={city.id}
                                value={String(city.id)}
                                disabled={city.id === disabledCityId}
                                className={selectStyles.item}
                            >
                                <Select.ItemText>{getCityName(t, city)}</Select.ItemText>
                                <span className={selectStyles.country}>{city.country_code}</span>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}

export default CitySelect;
