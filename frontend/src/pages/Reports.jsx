import { Activity, BarChart3, BookOpenCheck, Brain, CalendarDays, Clock3, Flame, RefreshCw, Target, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../components/ui/Card.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import { reportApi } from "../services/reportApi";

const tooltipStyle = {
  background: "#111111",
  border: "1px solid rgba(249,115,22,.55)",
  borderRadius: "10px",
  boxShadow: "0 16px 40px rgba(0,0,0,.45)",
  color: "#f5f5f5"
};

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatMinutes(minutes = 0) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function reportDayKey(report) {
  return new Date(report.date).toLocaleDateString("en-CA");
}

function getUniqueDailyReports(reports) {
  const byDay = new Map();
  for (const report of reports) {
    const key = reportDayKey(report);
    const current = byDay.get(key);
    const currentTime = current ? new Date(current.generatedAt || current.updatedAt || current.date).getTime() : 0;
    const nextTime = new Date(report.generatedAt || report.updatedAt || report.date).getTime();
    if (!current || nextTime >= currentTime) byDay.set(key, report);
  }
  return Array.from(byDay.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getDailyMessage(report) {
  if (!report) return "Generate a report after adding tasks.";
  if (report.totalTasks === 0) return "No tasks were planned for this day. Add tasks before generating reports.";
  if (report.completionRate === 100) return "Excellent day. You finished every planned task.";
  if (report.completionRate >= 80) return "Strong day. You hit the consistency target.";
  if (report.completionRate >= 50) return "Decent progress, but protect your hardest task earlier in the day.";
  return "Low completion day. Reduce task count or start with one high-priority task.";
}

function getTrendMessage(reports) {
  if (!reports.length) return "Generate reports to see your preparation pattern.";
  const activeDays = reports.filter((report) => report.totalTasks > 0);
  if (!activeDays.length) return "Plan tasks for the next study day to start building a trend.";
  const average = Math.round(activeDays.reduce((sum, report) => sum + report.completionRate, 0) / activeDays.length);
  const best = activeDays.reduce((top, report) => (report.completionRate > top.completionRate ? report : top), activeDays[0]);
  if (average >= 80) return `Strong consistency. Your recent average is ${average}% and the best day was ${formatDate(best.date)}.`;
  if (average >= 50) return `Average is ${average}%. Push the first task earlier and keep one focused revision slot.`;
  return `Average is ${average}%. Reduce daily load and finish one high-priority task before adding more.`;
}

export default function Reports() {
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadReports() {
    const [dailyResponse, weeklyResponse] = await Promise.all([reportApi.daily(), reportApi.weekly()]);
    setDaily(dailyResponse.data.data.reports);
    setWeekly(weeklyResponse.data.data.reports);
  }

  useEffect(() => {
    loadReports().finally(() => setLoading(false));
  }, []);

  async function generate() {
    setLoading(true);
    await Promise.all([reportApi.generateDaily(), reportApi.generateWeekly()]);
    await loadReports();
    setLoading(false);
  }

  const uniqueDaily = useMemo(() => getUniqueDailyReports(daily), [daily]);
  const latestDaily = uniqueDaily[0];
  const latestWeekly = weekly[0];

  const chartData = useMemo(
    () =>
      uniqueDaily
        .slice(0, 7)
        .reverse()
        .map((report) => ({
          date: formatDate(report.date),
          completion: report.completionRate,
          xp: report.totalPointsEarned,
          study: report.totalStudyTimeMinutes || 0,
          tasks: report.totalTasks,
          completed: report.completedTasks
        })),
    [uniqueDaily]
  );

  const completionText = latestDaily
    ? `${latestDaily.completedTasks}/${latestDaily.totalTasks} tasks`
    : "No report yet";

  const focusArea =
    latestDaily?.weakestCategory && latestDaily.weakestCategory !== "N/A"
      ? latestDaily.weakestCategory
      : latestWeekly?.weakestCategory || "Not enough data";

  return (
    <div className="page reports-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Performance review</p>
          <h1>Reports</h1>
          <p className="page-subtitle">Understand your daily consistency, XP, weak areas, and next preparation focus.</p>
        </div>
        <button className="btn-primary" onClick={generate} disabled={loading}>
          <RefreshCw size={18} /> {loading ? "Generating..." : "Generate"}
        </button>
      </header>

      {loading && !daily.length && !weekly.length ? (
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
          <StatCard title="Today's Completion" value={`${latestDaily?.completionRate || 0}%`} detail={completionText} icon={Target} />
          <StatCard title="XP Today" value={latestDaily?.totalPointsEarned || 0} detail="From completed tasks" icon={Flame} />
          <StatCard title="Study Time" value={`${latestDaily?.totalStudyTimeMinutes || 0}m`} detail="Actual completed time" icon={Clock3} />
          <StatCard title="Focus Area" value={focusArea} detail="Lowest completion category" icon={Brain} />
        </section>
      )}

      <section className="report-overview-grid">
        <Card className="report-hero-card">
          <div className="section-title">
            <h2>Today's Report</h2>
            <span>{latestDaily ? formatDate(latestDaily.date) : "No report"}</span>
          </div>
          {loading && !latestDaily ? (
            <div className="report-skeleton-block">
              <div className="skeleton-line wide" />
              <div className="skeleton-line" />
              <div className="skeleton-chip-row"><span /><span /><span /></div>
            </div>
          ) : latestDaily ? (
            <>
              <div className="report-score-row">
                <div className="report-score">
                  <strong>{latestDaily.completionRate}%</strong>
                  <span>completion rate</span>
                </div>
                <div className="report-meter" aria-label="Daily completion">
                  <span style={{ width: `${Math.min(latestDaily.completionRate, 100)}%` }} />
                </div>
              </div>
              <p className="report-message">{getDailyMessage(latestDaily)}</p>
              <div className="report-action-strip">
                <span>Next useful move</span>
                <strong>{latestDaily.pendingTasks > 0 ? "Finish the highest-priority pending task first." : "Create tomorrow's plan with one revision task."}</strong>
              </div>
              <div className="metric-grid">
                <div><span>Completed</span><strong>{latestDaily.completedTasks}</strong></div>
                <div><span>Pending</span><strong>{latestDaily.pendingTasks}</strong></div>
                <div><span>Skipped</span><strong>{latestDaily.skippedTasks}</strong></div>
                <div><span>Total Tasks</span><strong>{latestDaily.totalTasks}</strong></div>
                <div><span>Strongest</span><strong>{latestDaily.strongestCategory}</strong></div>
                <div><span>Weakest</span><strong>{latestDaily.weakestCategory}</strong></div>
              </div>
            </>
          ) : (
            <div className="empty-state">Click Generate after creating or completing tasks.</div>
          )}
        </Card>

        <Card className="report-hero-card">
          <div className="section-title">
            <h2>Weekly Guidance</h2>
            <Trophy size={18} />
          </div>
          {loading && !latestWeekly ? (
            <div className="report-skeleton-block">
              <div className="skeleton-line wide" />
              <div className="skeleton-line" />
              <div className="skeleton-chip-row"><span /><span /></div>
            </div>
          ) : latestWeekly ? (
            <>
              <div className="weekly-guidance-grid">
                <div className="weekly-focus">
                  <span>Best day</span>
                  <strong>{latestWeekly.bestDay}</strong>
                </div>
                <div className="weekly-focus">
                  <span>Weekly completion</span>
                  <strong>{latestWeekly.completionRate}%</strong>
                </div>
                <div className="weekly-focus">
                  <span>Weakest area</span>
                  <strong>{latestWeekly.weakestCategory}</strong>
                </div>
              </div>
              <p className="report-message">{latestWeekly.improvementSuggestion}</p>
            </>
          ) : (
            <div className="empty-state">Generate weekly report to see suggestions.</div>
          )}
        </Card>
      </section>

      <section className="report-chart-grid">
        <Card className="chart-card">
          <div className="section-title">
            <h2>Completion Trend</h2>
            <BarChart3 size={18} />
          </div>
          <p className="chart-note">Percentage of planned tasks completed each day. Target is 80% or higher.</p>
          {loading && !chartData.length ? (
            <div className="chart-bars-skeleton"><span /><span /><span /><span /><span /></div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,.08)" />
                <XAxis dataKey="date" stroke="#a3a3a3" />
                <YAxis stroke="#a3a3a3" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="4 4" />
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#f5f5f5" }} labelStyle={{ color: "#f97316" }} formatter={(value, name) => (name === "completion" ? [`${value}%`, "Completion"] : [value, name])} />
                <Line type="monotone" dataKey="completion" stroke="#f97316" strokeWidth={4} dot={{ r: 5, fill: "#111", stroke: "#f97316", strokeWidth: 3 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
          <p className="chart-insight">{getTrendMessage(uniqueDaily.slice(0, 7))}</p>
        </Card>

        <Card className="chart-card">
          <div className="section-title">
            <h2>XP Earned</h2>
            <Activity size={18} />
          </div>
          <p className="chart-note">Reward points earned from completed preparation tasks.</p>
          {loading && !chartData.length ? (
            <div className="chart-bars-skeleton red"><span /><span /><span /><span /><span /></div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,.08)" />
                <XAxis dataKey="date" stroke="#a3a3a3" />
                <YAxis stroke="#a3a3a3" />
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#f5f5f5" }} labelStyle={{ color: "#f97316" }} cursor={{ fill: "rgba(249,115,22,.08)" }} formatter={(value) => [value, "XP"]} />
                <Bar dataKey="xp" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.date} fill={entry.xp > 0 ? "#f97316" : "rgba(255,255,255,.12)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </section>

      <Card>
        <div className="section-title">
          <h2>Daily Report History</h2>
          <BookOpenCheck size={18} />
        </div>
        <div className="report-table-wrap">
          {loading && !daily.length ? (
            <div className="report-table-skeleton">
              {Array.from({ length: 5 }, (_, index) => <div className="skeleton-line wide" key={index} />)}
            </div>
          ) : <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Tasks</th>
                <th>Completion</th>
                <th>XP</th>
                <th>Study</th>
                <th>Strongest</th>
                <th>Weakest</th>
                <th>Read</th>
              </tr>
            </thead>
            <tbody>
              {uniqueDaily.slice(0, 10).map((report) => (
                <tr key={report._id}>
                  <td>
                    <div className="report-date-cell">
                      <CalendarDays size={16} />
                      <strong>{formatDate(report.date)}</strong>
                    </div>
                  </td>
                  <td>{report.completedTasks}/{report.totalTasks}</td>
                  <td>
                    <div className="table-progress">
                      <span style={{ width: `${Math.min(report.completionRate, 100)}%` }} />
                    </div>
                    {report.completionRate}%
                  </td>
                  <td>{report.totalPointsEarned}</td>
                  <td>{formatMinutes(report.totalStudyTimeMinutes)}</td>
                  <td>{report.strongestCategory}</td>
                  <td>{report.weakestCategory}</td>
                  <td className={report.completionRate >= 80 ? "report-read good" : report.completionRate >= 50 ? "report-read mid" : "report-read low"}>
                    {report.completionRate >= 80 ? "On track" : report.completionRate >= 50 ? "Improve" : "Focus"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>}
          {!daily.length ? <div className="empty-state">No report history yet.</div> : null}
        </div>
      </Card>
    </div>
  );
}
