const API_URL = "http://127.0.0.1:8000";

export async function getCities() {
    const response = await fetch(`${API_URL}/cities`);

    if (!response.ok) {
        throw new Error(`Ошибка запроса: ${response.status}`);
    }

    const data = await response.json();

    return data;
}
