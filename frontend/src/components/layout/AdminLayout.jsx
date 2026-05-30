import {
  Activity,
  BarChart3,
  Bot,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Map,
  Settings,
  Shield,
  Users
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navItems = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/tasks", label: "Tasks", icon: ClipboardList },
  { to: "/admin/roadmaps", label: "Roadmaps", icon: Map },
  { to: "/admin/ai", label: "AI Logs", icon: Bot },
  { to: "/admin/emails", label: "Emails", icon: Mail },
  { to: "/admin/settings", label: "Health", icon: Settings },
  { to: "/admin/audit-logs", label: "Audit", icon: Activity },
  { to: "/dashboard", label: "User App", icon: Home }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell admin-shell">
      <aside className="sidebar admin-sidebar">
        <div>
          <p className="eyebrow">Control Center</p>
          <h1 className="brand">Admin Panel</h1>
          <span className="admin-role"><Shield size={14} /> {user?.role}</span>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <button className="icon-button" onClick={logout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <main className="content admin-content">
        <Outlet />
      </main>
    </div>
  );
}
