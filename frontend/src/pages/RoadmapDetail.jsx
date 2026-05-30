import { BookOpenCheck, CheckCircle2, Clock3, Flag, Layers3, Rocket, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import { roadmapApi } from "../services/roadmapApi";

export default function RoadmapDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await roadmapApi.get(id);
    setRoadmap(response.data.data.roadmap);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function activate() {
    await roadmapApi.activate(id);
    setMessage("Roadmap activated.");
    await load();
  }

  async function convert(mode) {
    const payload = mode === "next" ? { mode: "next", limitDays: 7 } : { mode: "all" };
    const response = await roadmapApi.convertToTasks(id, payload);
    const createdCount = response.data.data.createdTasks.length;
    const alreadyConvertedCount = response.data.data.alreadyConvertedCount || 0;
    const repairedCount = response.data.data.repairedCount || 0;
    const totalAvailable = createdCount + alreadyConvertedCount;
    setMessage(
      createdCount
        ? `${createdCount} tasks created${repairedCount ? ` after repairing ${repairedCount} stale roadmap markers` : ""}.`
        : `${alreadyConvertedCount} tasks were already added. Opening the imported task list.`
    );
    await load();
    if (totalAvailable > 0) {
      navigate(`/tasks?roadmapId=${id}&source=Roadmap&imported=${createdCount}`);
    }
  }

  if (!roadmap) {
    return (
      <div className="page">
        <Card className="skeleton-card roadmap-detail-skeleton">
          <div className="skeleton-line wide" />
          <div className="skeleton-line" />
          <div className="skeleton-chip-row"><span /><span /><span /></div>
        </Card>
        <Card className="skeleton-card"><div className="skeleton-line wide" /><div className="skeleton-line" /></Card>
      </div>
    );
  }

  function dayMinutes(day) {
    return day.tasks.reduce((sum, task) => sum + (task.estimatedTimeMinutes || 0), 0);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Roadmap detail</p>
          <h1>{roadmap.title}</h1>
          <p className="page-subtitle">{roadmap.summary}</p>
        </div>
        <div className="button-row">
          <button className="btn-secondary" onClick={activate}><Rocket size={18} /> Activate</button>
          <button className="btn-primary" onClick={() => convert("all")}>Convert Full Roadmap</button>
        </div>
      </header>
      {message ? <div className="alert soft">{message}</div> : null}
      <section className="stats-grid">
        <Card><p className="muted">Timeline</p><strong className="big-text">{roadmap.timelineDays} days</strong></Card>
        <Card><p className="muted">Daily Load</p><strong className="big-text">{roadmap.dailyStudyHours}h</strong></Card>
        <Card><p className="muted">Status</p><strong className="big-text">{roadmap.status}</strong></Card>
        <Card><p className="muted">Converted</p><strong className="big-text">{roadmap.days.flatMap((day) => day.tasks).filter((task) => task.convertedTaskId).length}</strong></Card>
      </section>
      <div className="roadmap-day-list">
        {roadmap.days.map((day) => (
          <Card className="roadmap-day-card" key={day._id}>
            <div className="roadmap-day-header">
              <div className="day-index">
                <span>Day</span>
                <strong>{day.dayNumber}</strong>
              </div>
              <div className="day-heading">
                <p className="eyebrow">{new Date(day.date).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })}</p>
                <h2>{day.theme}</h2>
                <div className="day-meta-row">
                  <span><Clock3 size={14} /> {dayMinutes(day)} min</span>
                  <span><Layers3 size={14} /> {day.tasks.length} tasks</span>
                  <span><Flag size={14} /> {day.tasks.filter((task) => task.priority === "Critical" || task.priority === "High").length} priority</span>
                </div>
              </div>
            </div>
            <div className="roadmap-task-list">
              {day.tasks.map((task) => (
                <div className="roadmap-task-item" key={task._id}>
                  <div className="roadmap-task-icon">
                    {task.convertedTaskId ? <CheckCircle2 size={18} /> : <BookOpenCheck size={18} />}
                  </div>
                  <div className="roadmap-task-content">
                    <div className="roadmap-task-title-row">
                      <strong>{task.title}</strong>
                      <span className={`roadmap-task-state ${task.convertedTaskId ? "converted" : ""}`}>
                        {task.convertedTaskId ? "Added" : "Planned"}
                      </span>
                    </div>
                    <div className="roadmap-task-badges">
                      <span>{task.category}</span>
                      <span className={`priority-${task.priority?.toLowerCase()}`}>{task.priority}</span>
                      <span>{task.difficulty}</span>
                      <span><Clock3 size={13} /> {task.estimatedTimeMinutes} min</span>
                    </div>
                    <p>{task.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <button className="btn-primary" onClick={() => convert("all")}><Sparkles size={18} /> Convert Full Roadmap To Tasks</button>
    </div>
  );
}
