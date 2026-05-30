import { Bot, CheckSquare, Mail, Map, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { adminApi } from "../../services/adminApi";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.summary().then((response) => setSummary(response.data.data)).finally(() => setLoading(false));
  }, []);

  const cards = summary
    ? [
        ["Users", summary.users.total, `${summary.users.active} active`, Users],
        ["Tasks", summary.tasks.total, `${summary.tasks.completed} completed`, CheckSquare],
        ["Roadmaps", summary.roadmaps.total, `${summary.roadmaps.active} active`, Map],
        ["AI Generations", summary.ai.generations, "Prompt history", Bot],
        ["Emails Sent", summary.emails.sent, `${summary.emails.failed} failed`, Mail],
        ["Avg Completion", `${summary.reports.avgCompletionRate}%`, "Recent reports", TrendingUp]
      ]
    : [];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Admin overview</p>
          <h1>Platform Control Center</h1>
          <p className="page-subtitle">Monitor user activity, AI generation, email health, and preparation performance.</p>
        </div>
      </header>

      <section className="stats-grid admin-stats-grid">
        {loading
          ? Array.from({ length: 6 }, (_, index) => <Card className="stat-card skeleton-card" key={index}><div className="stat-icon" /><div className="skeleton-line wide" /></Card>)
          : cards.map(([title, value, detail, icon]) => <StatCard key={title} title={title} value={value} detail={detail} icon={icon} />)}
      </section>

      <Card className="admin-panel">
        <div className="section-title"><h2>Top Preparation Categories</h2><span>All users</span></div>
        <div className="admin-category-list">
          {(summary?.topCategories || []).map((item) => (
            <div key={item.category}>
              <strong>{item.category}</strong>
              <span>{item.completed}/{item.total} completed</span>
              <div className="progress-track"><span style={{ width: `${item.total ? Math.round((item.completed / item.total) * 100) : 0}%` }} /></div>
            </div>
          ))}
          {!loading && !summary?.topCategories?.length ? <div className="empty-state">No task activity yet.</div> : null}
        </div>
      </Card>
    </div>
  );
}
