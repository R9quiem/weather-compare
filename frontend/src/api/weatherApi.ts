import type { City, ClimateResponse } from "../types/weather.ts";
import i18n from "../i18n.ts";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function getCities(): Promise<City[]> {
    const response = await fetch(`${API_URL}/cities`);

    if (!response.ok) {
        throw new Error(i18n.t("common.requestError", { status: response.status }));
    }

    const data = await response.json();

    return data;
}

export async function getDailyWeather(city_id: number): Promise<ClimateResponse> {
    const response = await fetch(`${API_URL}/weather/daily_averages/${city_id}`);

    if (!response.ok) {
        throw new Error(i18n.t("common.requestError", { status: response.status }));
    }

    const data = await response.json();

    return data;
}
