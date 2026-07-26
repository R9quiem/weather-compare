import { useContext } from "react";
import { UnitsContext } from "./unitsContext.js";

export function useUnits() {
    const context = useContext(UnitsContext);
    if (!context) throw new Error("useUnits must be used inside UnitProvider");
    return context;
}
