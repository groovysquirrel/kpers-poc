import { Route, Routes } from "react-router-dom";
import Login from "./containers/Login.tsx";
import Notes from "./containers/Notes.tsx";
import Signup from "./containers/Signup.tsx";
import NewNote from "./containers/NewNote.tsx";
import Settings from "./containers/Settings.tsx";
import NotFound from "./containers/NotFound.tsx";
import AuthenticatedRoute from "./components/AuthenticatedRoute.tsx";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute.tsx";
import DashboardPage from "./pages/Dashboard/DashboardPage.tsx";
import ManagersPage from "./pages/Managers/ManagersPage.tsx";
import ManagerDetailPage from "./pages/Managers/ManagerDetailPage.tsx";
import EventsPage from "./pages/Events/EventsPage.tsx";
import EventCreatePage from "./pages/Events/EventCreatePage.tsx";
import SearchPage from "./pages/Search/SearchPage.tsx";
import DocumentsPage from "./pages/Documents/DocumentsPage.tsx";

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
      <Route
        path="/login"
        element={
          <UnauthenticatedRoute>
            <Login />
          </UnauthenticatedRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <UnauthenticatedRoute>
            <Signup />
          </UnauthenticatedRoute>
        }
      />
      <Route path="/settings" element={<AuthenticatedRoute><Settings /></AuthenticatedRoute>} />
      <Route path="/notes/new" element={<AuthenticatedRoute><NewNote /></AuthenticatedRoute>} />
      <Route path="/notes/:id" element={<AuthenticatedRoute><Notes /></AuthenticatedRoute>} />
      {/* Finally, catch all unmatched routes */}
      <Route path="*" element={<NotFound />} />;
    </Routes>
  );
}
