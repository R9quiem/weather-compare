import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout.tsx";
import CityWeatherPage from "../pages/CityWeatherPage/CityWeatherPage.tsx";
import CurrentWeatherPage from "../pages/CurrentWeatherPage/CurrentWeatherPage.tsx";
import WeatherComparePage from "../pages/WeatherComparePage/WeatherComparePage.tsx";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { index: true, element: <Navigate to="/climate" replace /> },
            { path: "/weather", element: <CurrentWeatherPage /> },
            { path: "/climate", element: <CityWeatherPage /> },
            { path: "/compare", element: <WeatherComparePage /> },
            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);
