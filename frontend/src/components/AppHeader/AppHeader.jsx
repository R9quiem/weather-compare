import { NavLink } from "react-router-dom";
import styles from "./AppHeader.module.css";

function AppHeader() {
    return (
        <header className={styles["app-header"]}>
            <div className={styles["app-name"]}>Weather Report</div>
            <nav className={styles["app-nav"]}>
                <NavLink to="/" end>
                    Historical Weather
                </NavLink>
                <NavLink to="/compare">Compare Cities</NavLink>
            </nav>
        </header>
    );
}

export default AppHeader;
