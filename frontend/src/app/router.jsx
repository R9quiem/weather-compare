import { createBrowserRouter } from "react-router-dom";
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
            { path: "/", element: <CurrentWeatherPage /> },
            { path: "/climate", element: <CityWeatherPage /> },
            { path: "/compare", element: <WeatherComparePage /> },
            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);
