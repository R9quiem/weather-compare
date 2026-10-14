import type { ComponentProps } from "react";
import styles from "./DashboardCard.module.css";

type DashboardCardProps = ComponentProps<"section"> & { variant?: "primary" | "secondary" };
function DashboardCard({
    children,
    className = "",
    variant = "primary",
    ...props
}: DashboardCardProps) {
    return (
        <section {...props} className={`${styles.card} ${styles[variant]} ${className}`}>
            {children}
        </section>
    );
}

export default DashboardCard;
