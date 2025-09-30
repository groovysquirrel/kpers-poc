import { Route, Routes } from "react-router-dom";
import AuthenticatedRoute from "./components/AuthenticatedRoute.tsx";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute.tsx";
import Login from "./pages/System/Login.tsx";
import NotFound from "./pages/System/NotFound.tsx";
import DashboardPage from "./pages/Dashboard/DashboardPage.tsx";
import ManagersPage from "./pages/Managers/ManagersPage.tsx";
import ManagerDetailPage from "./pages/Managers/ManagerDetailPage.tsx";
import EventsPage from "./pages/Events/EventsPage.tsx";
import EventCreatePage from "./pages/Events/EventCreatePage.tsx";
import SearchPage from "./pages/Search/SearchPage.tsx";
import DocumentsPage from "./pages/Documents/DocumentsPage.tsx";
import AdminPage from "./pages/Admin/AdminPage.tsx";
import SettingsPage from "./pages/Settings/SettingsPage.tsx";

export default function Links() {
  return (
    <Routes>
      <Route path="/" element={<AuthenticatedRoute><DashboardPage /></AuthenticatedRoute>} />
      <Route path="/dashboard" element={<AuthenticatedRoute><DashboardPage /></AuthenticatedRoute>} />
      <Route path="/managers" element={<AuthenticatedRoute><ManagersPage /></AuthenticatedRoute>} />
      <Route path="/managers/:id" element={<AuthenticatedRoute><ManagerDetailPage /></AuthenticatedRoute>} />
      <Route path="/events" element={<AuthenticatedRoute><EventsPage /></AuthenticatedRoute>} />
      <Route path="/events/new" element={<AuthenticatedRoute><EventCreatePage /></AuthenticatedRoute>} />
      <Route path="/documents" element={<AuthenticatedRoute><DocumentsPage /></AuthenticatedRoute>} />
      <Route path="/search" element={<AuthenticatedRoute><SearchPage /></AuthenticatedRoute>} />
      <Route path="/admin" element={<AuthenticatedRoute><AdminPage /></AuthenticatedRoute>} />
      <Route
        path="/login"
        element={
          <UnauthenticatedRoute>
            <Login />
          </UnauthenticatedRoute>
        }
      />
     
      <Route path="/settings" element={<AuthenticatedRoute><SettingsPage /></AuthenticatedRoute>} />
      
      {/* Finally, catch all unmatched routes */}
      <Route path="*" element={<NotFound />} />;
    </Routes>
  );
}
