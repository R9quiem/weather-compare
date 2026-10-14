import type { ThemeContextValue } from "../types/preferences.ts";
import { createContext } from "react";

export const ThemeContext = createContext<ThemeContextValue | null>(null);
