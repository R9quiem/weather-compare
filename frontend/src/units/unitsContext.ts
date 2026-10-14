import type { UnitsContextValue } from "../types/preferences.ts";
import { createContext } from "react";

export const UnitsContext = createContext<UnitsContextValue | null>(null);
