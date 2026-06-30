import {NavLink} from "react-router-dom";
import styles from "./AppHeader.module.css"


function AppHeader() {
  return (
    <header className={styles["app-header"]}>
      <div>Weather Compare</div>
      <nav className={styles["app-nav"]}>
        <NavLink to="/" end>
          City Weather
        </NavLink>
        <NavLink to="/compare">
            Compare Weather
        </NavLink>
      </nav>
    </header>
  );
}

export default AppHeader;