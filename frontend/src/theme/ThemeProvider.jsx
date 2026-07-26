import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./themeContext.js";

const STORAGE_KEY = "weather-report-theme";
const VALID_THEMES = new Set(["light", "dark", "system"]);

function readTheme() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return VALID_THEMES.has(stored) ? stored : "system";
    } catch {
        return "system";
    }
}

function resolveTheme(theme, mediaQuery) {
    if (theme !== "system") return theme;
    return mediaQuery.matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(readTheme);
    const [resolvedTheme, setResolvedTheme] = useState(
        () => document.documentElement.dataset.theme ?? "light"
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        function applyTheme() {
            const resolved = resolveTheme(theme, mediaQuery);
            document.documentElement.dataset.theme = resolved;
            document.documentElement.style.colorScheme = resolved;
            setResolvedTheme(resolved);
        }

        applyTheme();
        if (theme !== "system") return undefined;

        mediaQuery.addEventListener("change", applyTheme);
        return () => mediaQuery.removeEventListener("change", applyTheme);
    }, [theme]);

    const setTheme = useCallback((nextTheme) => {
        if (!VALID_THEMES.has(nextTheme)) return;
        setThemeState(nextTheme);
        try {
            localStorage.setItem(STORAGE_KEY, nextTheme);
        } catch {
            // The selected theme still applies for this session.
        }
    }, []);

    const value = useMemo(
        () => ({ theme, resolvedTheme, setTheme }),
        [resolvedTheme, setTheme, theme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
