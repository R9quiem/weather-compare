import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import styles from "./StatusScene.module.css";

function ReturnLink({ to, children }) {
    return (
        <Link className={styles.returnLink} to={to}>
            <ArrowLeft aria-hidden="true" />
            {children}
        </Link>
    );
}

function ComingSoonScene() {
    const { t } = useTranslation();

    return (
        <section className={`${styles.page} ${styles.coming}`}>
            <div className={styles.frame}>
                <div className={styles.sun} aria-hidden="true" />
                <div className={styles.comingCopy}>
                    <h1>{t("status.coming.title")}</h1>
                    <p>{t("status.coming.description")}</p>
                    <Link className={styles.comingAction} to="/climate">
                        {t("status.coming.action")}
                        <ArrowRight aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

function MissingSunRadar() {
    const afterimageAngles = [8, 42, 76, 118, 154, 194, 230, 274, 310, 340];

    return (
        <div className={styles.missingSunScene} aria-hidden="true">
            <div className={styles.missingSun} />
            <div className={`${styles.scanner} ${styles.scannerLeft}`}>
                <i />
            </div>
            <div className={`${styles.scanner} ${styles.scannerRight}`}>
                <i />
            </div>
            <div className={`${styles.scanner} ${styles.scannerTop}`}>
                <i />
            </div>
            <div className={styles.afterimageMarks}>
                {afterimageAngles.map((angle, index) => (
                    <i key={angle} style={{ "--angle": `${angle}deg`, "--mark-index": index }} />
                ))}
            </div>
            <div className={styles.alertLabel}>OBJECT LOST</div>
        </div>
    );
}

function NotFoundScene() {
    const { t } = useTranslation();

    return (
        <section className={`${styles.page} ${styles.notFound}`}>
            <div className={styles.frame}>
                <div className={styles.errorNumber} aria-hidden="true">
                    404
                </div>
                <MissingSunRadar />
                <div className={styles.notFoundCopy}>
                    <p>{t("status.notFound.eyebrow")}</p>
                    <h1>{t("status.notFound.title")}</h1>
                    <span>{t("status.notFound.description")}</span>
                </div>
                <ReturnLink to="/">{t("status.returnHome")}</ReturnLink>
            </div>
        </section>
    );
}

function StatusScene({ mode }) {
    return mode === "coming" ? <ComingSoonScene /> : <NotFoundScene />;
}

export default StatusScene;
