import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import { adminApi } from "../../services/adminApi";
import { formatDate } from "../../utils/format";

export default function AdminRoadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [status, setStatus] = useState("");

  function load() {
    adminApi.roadmaps({ status, limit: 50 }).then((response) => setRoadmaps(response.data.data.roadmaps));
  }

  useEffect(load, [status]);

  async function remove(id) {
    if (!confirm("Delete this roadmap?")) return;
    await adminApi.deleteRoadmap(id);
    load();
  }

  return (
    <div className="page">
      <header className="page-header"><div><p className="eyebrow">AI schedules</p><h1>Roadmap Monitoring</h1></div></header>
      <Card className="filters"><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option><option>Draft</option><option>Active</option><option>Completed</option><option>Archived</option></select></Card>
      <Card><div className="report-table-wrap"><table className="report-table admin-table">
        <thead><tr><th>Roadmap</th><th>User</th><th>Status</th><th>Focus</th><th>Timeline</th><th></th></tr></thead>
        <tbody>{roadmaps.map((roadmap) => <tr key={roadmap._id}>
          <td><strong>{roadmap.title}</strong><br /><span>{formatDate(roadmap.createdAt)}</span></td>
          <td>{roadmap.userId?.name || "Unknown"}</td>
          <td><span className={`status ${roadmap.status?.toLowerCase()}`}>{roadmap.status}</span></td>
          <td>{roadmap.focusAreas?.join(", ")}</td>
          <td>{roadmap.timelineDays} days - {roadmap.dailyStudyHours}h/day</td>
          <td><button className="icon-button danger" onClick={() => remove(roadmap._id)} title="Delete roadmap"><Trash2 size={16} /></button></td>
        </tr>)}</tbody>
      </table></div></Card>
    </div>
  );
}
