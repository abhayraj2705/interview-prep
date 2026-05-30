import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <main className="auth-shell">
      <div className="auth-panel">
        <Outlet />
      </div>
    </main>
  );
}
