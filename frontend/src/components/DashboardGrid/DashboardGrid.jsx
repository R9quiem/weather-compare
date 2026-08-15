import styles from "./DashboardGrid.module.css";

function DashboardGrid({ children, className = "" }) {
    const gridClasses = [styles.grid, className].filter(Boolean).join(" ");

    return <div className={gridClasses}>{children}</div>;
}

export default DashboardGrid;
