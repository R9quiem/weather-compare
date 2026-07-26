import { DropdownMenu } from "radix-ui";
import { useTranslation } from "react-i18next";

import gbFlag from "../../assets/flags/gb.svg";
import ruFlag from "../../assets/flags/ru.svg";
import { changeLanguage } from "../../i18n.js";
import controlStyles from "../AppHeader/HeaderControl.module.css";
import styles from "./LanguageSwitcher.module.css";

const LANGUAGES = [
    { code: "ru", flag: ruFlag, nameKey: "language.russian" },
    { code: "en", flag: gbFlag, nameKey: "language.english" },
];

function LanguageSwitcher() {
    const { i18n, t } = useTranslation();
    const currentLanguageCode = i18n.resolvedLanguage ?? i18n.language;
    const currentLanguage =
        LANGUAGES.find((language) => language.code === currentLanguageCode) ?? LANGUAGES[0];

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    type="button"
                    className={`${controlStyles.control} ${styles.trigger}`}
                    aria-label={`${t("language.label")}: ${t(currentLanguage.nameKey)}`}
                >
                    <img className={styles.flag} src={currentLanguage.flag} alt="" />
                    <span className={styles.chevron} aria-hidden="true" />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className={styles.menu}
                    align="end"
                    sideOffset={8}
                    aria-label={t("language.label")}
                >
                    <DropdownMenu.RadioGroup
                        value={currentLanguage.code}
                        onValueChange={changeLanguage}
                    >
                        {LANGUAGES.map((language) => (
                            <DropdownMenu.RadioItem
                                key={language.code}
                                value={language.code}
                                className={styles.option}
                            >
                                <img className={styles.flag} src={language.flag} alt="" />
                                <span className={styles.name}>{t(language.nameKey)}</span>
                                <DropdownMenu.ItemIndicator className={styles.check}>
                                    ✓
                                </DropdownMenu.ItemIndicator>
                            </DropdownMenu.RadioItem>
                        ))}
                    </DropdownMenu.RadioGroup>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

export default LanguageSwitcher;
