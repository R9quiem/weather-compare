import {Select} from "radix-ui";

import styles from "./CitySelect.module.css"


function CitySelect({cities, selectedCityId, setSelectedCityId, disabledCityId, placeholder}) {
    return (
        <Select.Root
            value={selectedCityId == null ? undefined : String(selectedCityId)}
            onValueChange={(newValue) => setSelectedCityId(Number(newValue))}
        >
            <Select.Trigger className={styles["city-select-trigger"]}>
                <Select.Value placeholder={placeholder}/>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content
                    className={styles["city-select-content"]}
                    align="start"
                    position="popper"
                    sideOffset={8}
                >
                    <Select.Viewport className={styles["city-select-viewport"]}>
                        {cities.map((city) => (
                            <Select.Item
                                key={city.id}
                                value={String(city.id)}
                                disabled={city.id === disabledCityId}
                                className={styles["city-select-item"]}
                            >
                                <Select.ItemText>
                                    {city.name}, {city.country_code}
                                </Select.ItemText>

                            </Select.Item>
                        ))}

                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}

export default CitySelect;