import { Monitor, Moon, Sun, SunMoon } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../theme/useTheme.js";
import controlStyles from "../AppHeader/HeaderControl.module.css";
import styles from "./ThemeSwitcher.module.css";

const THEMES = [
    { value: "light", labelKey: "theme.light", Icon: Sun },
    { value: "dark", labelKey: "theme.dark", Icon: Moon },
    { value: "system", labelKey: "theme.system", Icon: Monitor },
];

function ThemeSwitcher() {
    const { t } = useTranslation();
    const { theme, setTheme } = useTheme();
    const currentTheme = THEMES.find((item) => item.value === theme) ?? THEMES[2];
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    type="button"
                    className={`${controlStyles.control} ${styles.trigger}`}
                    aria-label={`${t("theme.label")}: ${t(currentTheme.labelKey)}`}
                >
                    <SunMoon aria-hidden="true" />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content className={styles.menu} align="end" sideOffset={8}>
                    <DropdownMenu.Label className={styles.title}>
                        {t("theme.label")}
                    </DropdownMenu.Label>
                    <DropdownMenu.RadioGroup
                        className={styles.options}
                        value={theme}
                        onValueChange={setTheme}
                    >
                        {THEMES.map(({ value, labelKey, Icon }) => (
                            <DropdownMenu.RadioItem
                                key={value}
                                value={value}
                                className={styles.option}
                            >
                                <Icon aria-hidden="true" />
                                <span>{t(labelKey)}</span>
                            </DropdownMenu.RadioItem>
                        ))}
                    </DropdownMenu.RadioGroup>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

export default ThemeSwitcher;
