import styles from "./DashboardCard.module.css";

function DashboardCard({ children, className = "", variant = "primary", ...props }) {
    return (
        <section {...props} className={`${styles.card} ${styles[variant]} ${className}`}>
            {children}
        </section>
    );
}

export default DashboardCard;
