import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout.jsx";
import CityWeatherPage from "../pages/CityWeatherPage/CityWeatherPage.jsx";
import CurrentWeatherPage from "../pages/CurrentWeatherPage/CurrentWeatherPage.jsx";
import WeatherComparePage from "../pages/WeatherComparePage/WeatherComparePage.jsx";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage.jsx";

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
