import type { ReactNode } from "react";
import styles from "./DashboardGrid.module.css";

interface DashboardGridProps {
    children: ReactNode;
    className?: string;
}

function DashboardGrid({ children, className = "" }: DashboardGridProps) {
    const gridClasses = [styles.grid, className].filter(Boolean).join(" ");

    return <div className={gridClasses}>{children}</div>;
}

export default DashboardGrid;
