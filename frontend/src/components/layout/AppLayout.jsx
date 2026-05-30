import { BarChart3, Bot, CheckSquare, Gift, LayoutDashboard, LogOut, Map, Shield, User } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/ai-planner", label: "AI Planner", icon: Bot },
  { to: "/roadmaps", label: "Roadmaps", icon: Map },
  { to: "/rewards", label: "Rewards", icon: Gift },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User }
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const items = ["Admin", "SuperAdmin"].includes(user?.role)
    ? [...navItems, { to: "/admin/dashboard", label: "Admin", icon: Shield }]
    : navItems;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Placement Prep</p>
          <h1 className="brand">Reward Todo</h1>
        </div>
        <nav className="nav-list">
          {items.map((item) => {
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
            <span>{user?.targetRole}</span>
          </div>
          <button className="icon-button" onClick={logout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
