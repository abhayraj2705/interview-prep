import { Search, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card.jsx";
import { adminApi } from "../../services/adminApi";
import { formatDate } from "../../utils/format";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: "", role: "", status: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.users({ ...filters, limit: 50 }).then((response) => setUsers(response.data.data.users)).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="page">
      <header className="page-header"><div><p className="eyebrow">Admin users</p><h1>User Management</h1></div></header>
      <Card className="filters admin-filters">
        <label><Search size={16} /> <input placeholder="Search users" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></label>
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}><option value="">All roles</option><option>User</option><option>Admin</option><option>SuperAdmin</option></select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option><option>Active</option><option>Suspended</option></select>
      </Card>
      <Card>
        <div className="report-table-wrap">
          <table className="report-table admin-table">
            <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Target</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="6">Loading users...</td></tr> : users.map((user) => (
                <tr key={user._id}>
                  <td><strong>{user.name}</strong><br /><span>{user.email}</span></td>
                  <td><span className="mini-badge"><Shield size={12} /> {user.role || "User"}</span></td>
                  <td><span className={`mini-badge status-${String(user.status).toLowerCase()}`}>{user.status || "Active"}</span></td>
                  <td>{user.targetRole}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td><Link className="btn-secondary small-btn" to={`/admin/users/${user._id}`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
