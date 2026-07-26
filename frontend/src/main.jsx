import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter/wght.css";
import "./i18n.js";
import "./styles/theme.css";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router.jsx";
import { ThemeProvider } from "./theme/ThemeProvider.jsx";
import { UnitProvider } from "./units/UnitsContext.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ThemeProvider>
            <UnitProvider>
                <RouterProvider router={router} />
            </UnitProvider>
        </ThemeProvider>
    </StrictMode>
);
