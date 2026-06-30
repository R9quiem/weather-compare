import { Outlet } from "react-router-dom";
import AppHeader from "../components/AppHeader/AppHeader.jsx";

function AppLayout() {
  return (
    <div className="app-shell">
        <AppHeader/>
        <div className="app-body">
            <main className="app-content">
              <Outlet />
            </main>
        </div>
    </div>
  );
}

export default AppLayout;