import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./AppLayout.jsx";
import CityWeatherPage from "../pages/CityWeatherPage/CityWeatherPage.jsx";
import WeatherComparePage from "../pages/WeatherComparePage/WeatherComparePage.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { path: "/", element: <CityWeatherPage /> },
            { path: "/compare", element: <WeatherComparePage /> },
        ],
    },
]);
