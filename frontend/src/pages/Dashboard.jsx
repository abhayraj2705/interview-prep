import { AlertTriangle, CheckCircle2, Clock3, Flame, Gift, Target, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import Card from "../components/ui/Card.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import DailySuggestionPanel from "../components/ai/DailySuggestionPanel.jsx";
import { reportApi } from "../services/reportApi";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    reportApi
      .dashboard()
      .then((response) => setSummary(response.data.data))
      .catch(() => setError("Dashboard data could not be loaded. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const today = summary?.today || {};
  const reward = summary?.reward || {};
  const tasks = summary?.todayTasks || [];
  const completed = today.completedTasks || 0;
  const pending = today.pendingTasks || 0;
  const skipped = today.skippedTasks || 0;
  const completionRate = today.completionRate || 0;
  const priorityRank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  const nextTask = tasks
    .filter((task) => task.status !== "Completed")
    .sort((a, b) => (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0) || (b.estimatedTimeMinutes || 0) - (a.estimatedTimeMinutes || 0))[0];
  const nextAction =
    pending > 0
      ? `Start with ${nextTask?.title || "your highest priority task"}.`
      : completed > 0
        ? "Clean finish. Convert this momentum into tomorrow's first block."
        : "No tasks due yet. Generate or import a focused plan for today.";
  const chartData = [
    { name: "Completed", value: completed, color: "url(#completedGradient)" },
    { name: "Pending", value: pending, color: "url(#pendingGradient)" },
    { name: "Skipped", value: skipped, color: "url(#skippedGradient)" }
  ].filter((item) => item.value > 0);
  const trackData = [{ name: "Track", value: today.totalTasks || 1 }];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Today</p>
          <h1>Dashboard</h1>
        </div>
        <div className="status-pill">{loading ? "Syncing" : today.completionRate >= 80 ? "On track" : "Needs focus"}</div>
      </header>

      {error ? <div className="alert">{error}</div> : null}

      {loading ? (
        <section className="stats-grid">
          {Array.from({ length: 4 }, (_, index) => (
            <Card className="stat-card skeleton-card" key={index}>
              <div className="stat-icon" />
              <div>
                <div className="skeleton-line" />
                <div className="skeleton-line wide" />
              </div>
            </Card>
          ))}
        </section>
      ) : (
        <section className="stats-grid">
          <StatCard title="Today's Progress" value={`${today.completionRate || 0}%`} detail={`${completed}/${today.totalTasks || 0} tasks`} icon={Target} />
          <StatCard title="Current Streak" value={`${reward.currentStreak || 0} days`} detail={`Best ${reward.longestStreak || 0} days`} icon={Flame} />
          <StatCard title="Total XP" value={reward.totalPoints || 0} detail={reward.currentLevel || "Level 1"} icon={Gift} />
          <StatCard title="Study Time" value={`${today.totalStudyTimeMinutes || 0}m`} detail="Completed tasks" icon={Timer} />
        </section>
      )}

      <section className="dashboard-grid">
        <DailySuggestionPanel />

        <Card className="chart-card">
          <div className="section-title">
            <div>
              <h2>Task Completion</h2>
              <span>{today.totalTasks || 0} due today - {pending} still open</span>
            </div>
            <span className={`status-pill ${completionRate >= 80 ? "status-completed" : "status-pending"}`}>
              {completionRate >= 80 ? "On track" : "Needs focus"}
            </span>
          </div>
          <div className="completion-card-body">
            <div className="completion-visual">
              <div className="chart-wrap">
              {loading ? (
                <div className="dashboard-chart-skeleton">
                  <div />
                </div>
              ) : chartData.length ? (
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <defs>
                      <linearGradient id="completedGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#86efac" />
                        <stop offset="100%" stopColor="#16a34a" />
                      </linearGradient>
                      <linearGradient id="pendingGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#facc15" />
                        <stop offset="48%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#c2410c" />
                      </linearGradient>
                      <linearGradient id="skippedGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fb7185" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                      <filter id="ringGlow" x="-40%" y="-40%" width="180%" height="180%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.96 0 0.45 0 0 0.32 0 0 0.16 0 0.08 0 0 0 0.6 0" />
                        <feMerge>
                          <feMergeNode />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <Pie data={trackData} dataKey="value" innerRadius={70} outerRadius={108} startAngle={90} endAngle={-270} fill="rgba(255,255,255,.055)" stroke="rgba(255,255,255,.08)" strokeWidth={1} isAnimationActive={false} />
                    <Pie data={chartData} dataKey="value" innerRadius={74} outerRadius={108} paddingAngle={5} cornerRadius={12} stroke="rgba(5,5,5,.62)" strokeWidth={4} filter="url(#ringGlow)">
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    {completionRate < 80 ? (
                      <Sector cx="50%" cy="50%" innerRadius={112} outerRadius={116} startAngle={80} endAngle={-20} fill="rgba(249,115,22,.22)" />
                    ) : null}
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state">No tasks due today.</div>
              )}
                {!loading && chartData.length ? (
                  <div className="chart-center-label">
                    <strong>{completionRate}%</strong>
                    <span>done</span>
                  </div>
                ) : null}
              </div>
              {!loading ? (
                <div className="completion-progress">
                  <div><span>Daily progress</span><strong>{completed}/{today.totalTasks || 0}</strong></div>
                  <div className="progress-track"><span style={{ width: `${completionRate}%` }} /></div>
                </div>
              ) : null}
            </div>
            {!loading ? (
              <div className="completion-insights">
                <div className="completion-legend compact">
                  {[
                    ["Completed", completed, "#22c55e"],
                    ["Pending", pending, "#f97316"],
                    ["Skipped", skipped, "#ef4444"]
                  ].map(([label, value, color]) => (
                    <div key={label}>
                      <span style={{ background: color }} />
                      <strong>{value}</strong>
                      <small>{label}</small>
                    </div>
                  ))}
                </div>
                <div className="completion-next-action">
                  <span>Recommended next</span>
                  <strong>{nextAction}</strong>
                  {nextTask ? <small>{nextTask.priority} priority - {nextTask.estimatedTimeMinutes || 30} min - {nextTask.category}</small> : null}
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="section-title">
            <h2>Today's Tasks</h2>
            <span>{pending} pending</span>
          </div>
          <div className="task-preview-list">
            {loading ? (
              Array.from({ length: 4 }, (_, index) => (
                <div className="task-preview skeleton-card" key={index}>
                  <div>
                    <div className="skeleton-line wide" />
                    <div className="skeleton-line" />
                  </div>
                  <div className="skeleton-line" />
                </div>
              ))
            ) : tasks.slice(0, 6).map((task) => (
              <div className="task-preview" key={task._id}>
                <div className="task-preview-main">
                  <strong>{task.title}</strong>
                  <span>{task.category} - {task.priority}</span>
                  <div className="task-preview-meta">
                    <span>{task.difficulty || "Medium"}</span>
                    <span><Clock3 size={13} /> {task.estimatedTimeMinutes || 30} min</span>
                  </div>
                </div>
                {task.status === "Completed" ? (
                  <CheckCircle2 className="task-status-icon completed" size={20} />
                ) : (
                  <span className={`mini-badge status-${task.status?.toLowerCase().replace(/\s+/g, "-")}`}>{task.status}</span>
                )}
              </div>
            ))}
            {!loading && !tasks.length ? <div className="empty-state">Create your first preparation task.</div> : null}
          </div>
        </Card>

        <Card>
          <div className="section-title">
            <h2>Weak Area</h2>
            <AlertTriangle size={18} />
          </div>
          <p className="big-text">{today.weakestCategory || "N/A"}</p>
          <p className="muted">Give this category the first focused block tomorrow.</p>
        </Card>

        <Card>
          <div className="section-title">
            <h2>Reward Progress</h2>
            <Gift size={18} />
          </div>
          <p className="big-text">{reward.currentLevel || "Level 1: Beginner Candidate"}</p>
          <div className="progress-track"><span style={{ width: `${Math.min(((reward.totalPoints || 0) % 500) / 5, 100)}%` }} /></div>
          <p className="muted">{reward.badges?.length || 0} badges unlocked</p>
        </Card>
      </section>
    </div>
  );
}
