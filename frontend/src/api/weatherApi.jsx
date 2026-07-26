const API_URL = "http://127.0.0.1:8000";

import i18n from "../i18n.js";

export async function getCities() {
    const response = await fetch(`${API_URL}/cities`);

    if (!response.ok) {
        throw new Error(i18n.t("common.requestError", { status: response.status }));
    }

    const data = await response.json();

    return data;
}

export async function getDailyWeather(city_id) {
    const response = await fetch(`${API_URL}/weather/daily_averages/${city_id}`);

    if (!response.ok) {
        throw new Error(i18n.t("common.requestError", { status: response.status }));
    }

    const data = await response.json();

    return data;
}
