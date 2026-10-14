import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter/wght.css";
import "./i18n.ts";
import "./styles/theme.css";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router.tsx";
import { ThemeProvider } from "./theme/ThemeProvider.tsx";
import { UnitProvider } from "./units/UnitsContext.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider>
            <UnitProvider>
                <RouterProvider router={router} />
            </UnitProvider>
        </ThemeProvider>
    </StrictMode>
);
