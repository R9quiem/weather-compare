import { useEffect, useState } from "react";
import { getDailyWeather } from "../api/weatherApi.jsx";

export function useDailyWeather(cityId) {
    const [data, setData] = useState([]);
    const [windRose, setWindRose] = useState([]);
    const [cloudCover, setCloudCover] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (cityId === null) return;

        let isCancelled = false;

        async function loadDailyWeather() {
            try {
                setIsLoading(true);
                setError(null);

                const loadedWeather = await getDailyWeather(cityId);

                if (!isCancelled) {
                    setData(loadedWeather.daily);
                    setWindRose(loadedWeather.wind_rose);
                    setCloudCover(loadedWeather.cloud_cover ?? []);
                }
            } catch (requestError) {
                if (!isCancelled) {
                    setError(requestError.message);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadDailyWeather();

        return () => {
            isCancelled = true;
        };
    }, [cityId]);

    return { data, windRose, cloudCover, isLoading, error };
}
