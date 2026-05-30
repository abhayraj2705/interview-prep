import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout.jsx";
import AppLayout from "../components/layout/AppLayout.jsx";
import AuthLayout from "../components/layout/AuthLayout.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Landing from "../pages/Landing.jsx";
import Login from "../pages/Login.jsx";
import Profile from "../pages/Profile.jsx";
import Reports from "../pages/Reports.jsx";
import Rewards from "../pages/Rewards.jsx";
import AiPlanner from "../pages/AiPlanner.jsx";
import RoadmapDetail from "../pages/RoadmapDetail.jsx";
import Roadmaps from "../pages/Roadmaps.jsx";
import Signup from "../pages/Signup.jsx";
import Tasks from "../pages/Tasks.jsx";
import AdminAiLogs from "../pages/admin/AdminAiLogs.jsx";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import AdminEmails from "../pages/admin/AdminEmails.jsx";
import AdminRoadmaps from "../pages/admin/AdminRoadmaps.jsx";
import AdminSettings from "../pages/admin/AdminSettings.jsx";
import AdminTasks from "../pages/admin/AdminTasks.jsx";
import AdminUserDetail from "../pages/admin/AdminUserDetail.jsx";
import AdminUsers from "../pages/admin/AdminUsers.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Protected({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="screen-center">Loading your prep dashboard...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="screen-center">Loading...</div>;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AdminOnly({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <div className="screen-center">Loading admin panel...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return ["Admin", "SuperAdmin"].includes(user?.role) ? children : <Navigate to="/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
      </Route>
      <Route element={<Protected><AppLayout /></Protected>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/ai-planner" element={<AiPlanner />} />
        <Route path="/roadmaps" element={<Roadmaps />} />
        <Route path="/roadmaps/:id" element={<RoadmapDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route element={<AdminOnly><AdminLayout /></AdminOnly>}>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:id" element={<AdminUserDetail />} />
        <Route path="/admin/tasks" element={<AdminTasks />} />
        <Route path="/admin/roadmaps" element={<AdminRoadmaps />} />
        <Route path="/admin/ai" element={<AdminAiLogs />} />
        <Route path="/admin/emails" element={<AdminEmails />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
