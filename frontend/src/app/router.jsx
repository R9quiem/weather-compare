import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./AppLayout.jsx";
import CityWeatherPage from "../pages/CityWeatherPage.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "/", element: <CityWeatherPage /> },
    ],
  },
]);