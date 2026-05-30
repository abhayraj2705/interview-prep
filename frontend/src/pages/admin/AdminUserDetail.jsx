import { Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/ui/Card.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { adminApi } from "../../services/adminApi";
import { getErrorMessage } from "../../services/api";
import { formatDateTime } from "../../utils/format";

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: admin } = useAuth();
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    adminApi.user(id).then((response) => {
      setData(response.data.data);
      const user = response.data.data.user;
      setForm({ name: user.name, targetRole: user.targetRole, dailyStudyHoursGoal: user.dailyStudyHoursGoal, role: user.role || "User", status: user.status || "Active" });
    });
  }, [id]);

  async function save() {
    try {
      const response = await adminApi.updateUser(id, { ...form, dailyStudyHoursGoal: Number(form.dailyStudyHoursGoal) });
      setData((current) => ({ ...current, user: response.data.data.user }));
      setMessage("User updated.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  async function remove() {
    if (!confirm("Delete this user and their account access?")) return;
    await adminApi.deleteUser(id);
    navigate("/admin/users");
  }

  if (!data || !form) return <div className="screen-center">Loading user...</div>;

  return (
    <div className="page">
      <header className="page-header"><div><p className="eyebrow">User detail</p><h1>{data.user.name}</h1><p className="page-subtitle">{data.user.email}</p></div></header>
      {message ? <div className="alert soft">{message}</div> : null}
      <Card>
        <div className="form-grid">
          <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Target Role<input value={form.targetRole || ""} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} /></label>
          <label>Study Goal<input type="number" min="1" max="12" value={form.dailyStudyHoursGoal || 3} onChange={(e) => setForm({ ...form, dailyStudyHoursGoal: e.target.value })} /></label>
          <label>Role<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option>User</option><option>Admin</option><option>SuperAdmin</option></select></label>
          <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Suspended</option></select></label>
        </div>
        <div className="button-row">
          <button className="btn-primary" onClick={save}><Save size={18} /> Save Changes</button>
          {admin?.role === "SuperAdmin" ? <button className="icon-button danger" onClick={remove} title="Delete user"><Trash2 size={18} /></button> : null}
        </div>
      </Card>

      <section className="admin-detail-grid">
        <Card><p className="muted">Task Status</p>{data.taskStats.map((item) => <p key={item._id}><strong>{item._id}</strong> {item.count}</p>)}</Card>
        <Card><p className="muted">Recent Reports</p>{data.dailyReports.slice(0, 5).map((item) => <p key={item._id}>{formatDateTime(item.date)} - {item.completionRate}%</p>)}</Card>
      </section>

      <Card><div className="section-title"><h2>Recent Roadmaps</h2></div>{data.roadmaps.map((item) => <p key={item._id}><strong>{item.title}</strong> - {item.status}</p>)}</Card>
      <Card><div className="section-title"><h2>Recent Emails</h2></div>{data.emails.map((item) => <p key={item._id}>{item.emailType} - {item.status} - {formatDateTime(item.createdAt)}</p>)}</Card>
    </div>
  );
}
