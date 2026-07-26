import { Ruler } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useTranslation } from "react-i18next";
import { useUnits } from "../../units/useUnits.js";
import controlStyles from "../AppHeader/HeaderControl.module.css";
import styles from "./UnitSwitcher.module.css";

const GROUPS = [
    { metric: "temperature", values: ["celsius", "fahrenheit"] },
    { metric: "precipitation", values: ["mm", "in"] },
    { metric: "wind", values: ["kmh", "ms", "mph"] },
];

function UnitSwitcher() {
    const { t } = useTranslation();
    const { units, setUnit } = useUnits();
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    type="button"
                    className={`${controlStyles.control} ${styles.trigger}`}
                    aria-label={t("units.label")}
                >
                    <Ruler aria-hidden="true" />
                </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content className={styles.menu} align="end" sideOffset={8}>
                    <DropdownMenu.Label className={styles.title}>{t("units.label")}</DropdownMenu.Label>
                    {GROUPS.map(({ metric, values }, index) => (
                        <div className={styles.group} key={metric}>
                            {index > 0 && <DropdownMenu.Separator className={styles.separator} />}
                            <DropdownMenu.Label className={styles.label}>{t(`units.${metric}`)}</DropdownMenu.Label>
                            <DropdownMenu.RadioGroup
                                className={styles.options}
                                style={{ "--unit-columns": values.length }}
                                value={units[metric]}
                                onValueChange={(value) => setUnit(metric, value)}
                            >
                                {values.map((value) => (
                                    <DropdownMenu.RadioItem key={value} value={value} className={styles.option} onSelect={(event) => event.preventDefault()}>
                                        <span>{t(`units.values.${value}`)}</span>
                                    </DropdownMenu.RadioItem>
                                ))}
                            </DropdownMenu.RadioGroup>
                        </div>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

export default UnitSwitcher;
