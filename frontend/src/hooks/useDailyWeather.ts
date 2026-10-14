import type { DailyWeather, WindRoseSector, CloudCover, WeatherState } from "../types/weather.ts";
import { useEffect, useState } from "react";
import { getDailyWeather } from "../api/weatherApi.ts";

export function useDailyWeather(cityId: number | null): WeatherState {
    const [data, setData] = useState<DailyWeather[]>([]);
    const [windRose, setWindRose] = useState<WindRoseSector[]>([]);
    const [cloudCover, setCloudCover] = useState<CloudCover[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (cityId === null) return;

        const selectedCityId = cityId;
        let isCancelled = false;

        async function loadDailyWeather() {
            try {
                setIsLoading(true);
                setError(null);

                const loadedWeather = await getDailyWeather(selectedCityId);

                if (!isCancelled) {
                    setData(loadedWeather.daily);
                    setWindRose(loadedWeather.wind_rose);
                    setCloudCover(loadedWeather.cloud_cover ?? []);
                }
            } catch (requestError) {
                if (!isCancelled) {
                    setError(
                        requestError instanceof Error ? requestError.message : String(requestError)
                    );
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
