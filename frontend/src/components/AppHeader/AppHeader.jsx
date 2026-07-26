import { ArrowLeftRight, ChartSpline, CloudSun } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher.jsx";
import ThemeSwitcher from "../ThemeSwitcher/ThemeSwitcher.jsx";
import UnitSwitcher from "../UnitSwitcher/UnitSwitcher.jsx";
import controlStyles from "./HeaderControl.module.css";
import styles from "./AppHeader.module.css";

const NAV_ITEMS = [
    { to: "/", end: true, labelKey: "nav.current", Icon: CloudSun },
    { to: "/climate", labelKey: "nav.climate", Icon: ChartSpline },
    { to: "/compare", labelKey: "nav.compare", Icon: ArrowLeftRight },
];

function AppHeader() {
    const { t } = useTranslation();
    const { pathname } = useLocation();

    return (
        <header className={styles["app-header"]} data-sunlit={pathname === "/" ? "" : undefined}>
            <div className={styles["app-name"]}>{t("brand")}</div>
            <nav className={styles["app-nav"]} aria-label={t("nav.label")}>
                {NAV_ITEMS.map(({ to, end, labelKey, Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={controlStyles.control}
                        aria-label={t(labelKey)}
                    >
                        <Icon aria-hidden="true" />
                        <span className={styles["nav-label"]}>{t(labelKey)}</span>
                    </NavLink>
                ))}
            </nav>
            <div className={styles["app-tools"]}>
                <ThemeSwitcher />
                <UnitSwitcher />
                <LanguageSwitcher />
            </div>
        </header>
    );
}

export default AppHeader;
