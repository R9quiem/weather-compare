import styles from "./DashboardCard.module.css";

function DashboardCard({
  children,
  className = "",
  variant = "primary",
}) {
  return (
    <section
      className={`${styles.card} ${styles[variant]} ${className}`}
    >
      {children}
    </section>
  );
}

export default DashboardCard;