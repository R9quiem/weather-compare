export interface City {
    id: number;
    name: string;
    slug: string;
    country_code: string;
    latitude: number;
    longitude: number;
}

export interface DailyWeather {
    city_id: number;
    observed_date: string;
    temperature_2m_mean: number | null;
    temperature_2m_min: number | null;
    temperature_2m_max: number | null;
    apparent_temperature_mean: number | null;
    precipitation_sum: number | null;
    cloud_cover_mean: number | null;
    sunshine_duration_sum: number | null;
    relative_humidity_2m_mean: number | null;
    wind_speed_10m_mean: number | null;
    wind_direction_10m_dominant: number | null;
    wind_gusts_10m_max: number | null;
}

export type WindDirection = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
export interface WindRoseSector {
    direction: WindDirection;
    frequency: number;
    sample_count: number;
    average_speed: number | null;
}

export interface CloudCover {
    observed_date: string;
    clear: number;
    partly_cloudy: number;
    cloudy: number;
    sample_count: number;
    calibrated: boolean;
}

export interface ClimateResponse {
    daily: DailyWeather[];
    wind_rose: WindRoseSector[];
    cloud_cover?: CloudCover[];
}

export interface WeatherState {
    data: DailyWeather[];
    windRose: WindRoseSector[];
    cloudCover: CloudCover[];
    isLoading: boolean;
    error: string | null;
}

export type WeatherMetric = "temperature" | "precipitation" | "humidity" | "wind" | "cloud";
export type WindView = "speed" | "rose";
export type DailyNumericKey = {
    [K in keyof DailyWeather]: DailyWeather[K] extends number | null ? K : never;
}[keyof DailyWeather];
