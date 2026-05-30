import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import { adminApi } from "../../services/adminApi";
import { categories, priorities, statuses } from "../../utils/options";
import { formatDate } from "../../utils/format";

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ status: "", category: "", priority: "", source: "" });

  useEffect(() => {
    adminApi.tasks({ ...filters, limit: 50 }).then((response) => setTasks(response.data.data.tasks));
  }, [filters]);

  return (
    <div className="page">
      <header className="page-header"><div><p className="eyebrow">Global tasks</p><h1>Task Monitoring</h1></div></header>
      <Card className="filters">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}><option value="">All priorities</option>{priorities.map((item) => <option key={item}>{item}</option>)}</select>
      </Card>
      <Card><div className="report-table-wrap"><table className="report-table admin-table">
        <thead><tr><th>Task</th><th>User</th><th>Category</th><th>Status</th><th>Due</th><th>Source</th></tr></thead>
        <tbody>{tasks.map((task) => <tr key={task._id}>
          <td><strong>{task.title}</strong><br /><span>{task.priority} - {task.difficulty}</span></td>
          <td>{task.userId?.name || "Unknown"}</td>
          <td>{task.category}</td>
          <td><span className={`mini-badge status-${task.status?.toLowerCase().replace(/\s+/g, "-")}`}>{task.status}</span></td>
          <td>{formatDate(task.dueDate)}</td>
          <td>{task.source?.type || "Manual"}</td>
        </tr>)}</tbody>
      </table></div></Card>
    </div>
  );
}
