import { CalendarDays, Clock3, Map, Plus, Route, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import { roadmapApi } from "../services/roadmapApi";

export default function Roadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roadmapApi.list().then((response) => setRoadmaps(response.data.data.roadmaps)).finally(() => setLoading(false));
  }, []);

  const activeCount = roadmaps.filter((roadmap) => roadmap.status === "Active").length;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">AI schedules</p>
          <h1>Roadmaps</h1>
          <p className="page-subtitle">Browse generated preparation plans, compare daily load, and continue from the plan that matches your current target.</p>
        </div>
        <Link className="btn-primary" to="/ai-planner"><Plus size={18} /> New Roadmap</Link>
      </header>

      <Card className="roadmap-library-hero">
        <div>
          <p className="eyebrow">Planning library</p>
          <h2>{loading ? "Loading roadmaps" : `${roadmaps.length} roadmap${roadmaps.length === 1 ? "" : "s"} available`}</h2>
          <span>{activeCount ? `${activeCount} active plan${activeCount === 1 ? "" : "s"} guiding your schedule.` : "Activate a plan to make it your daily source of truth."}</span>
        </div>
        <div className="roadmap-library-stats">
          <div><Route size={18} /><strong>{activeCount}</strong><span>Active</span></div>
          <div><Sparkles size={18} /><strong>{Math.max(roadmaps.length - activeCount, 0)}</strong><span>Drafts</span></div>
        </div>
      </Card>

      <section className="roadmap-grid">
        {loading ? (
          Array.from({ length: 4 }, (_, index) => (
            <Card className="roadmap-card skeleton-card" key={index}>
              <div className="skeleton-line wide" />
              <div className="skeleton-line" />
              <div className="skeleton-chip-row"><span /><span /><span /></div>
            </Card>
          ))
        ) : roadmaps.map((roadmap) => (
          <Link className="roadmap-card-link" to={`/roadmaps/${roadmap._id}`} key={roadmap._id}>
            <Card className="roadmap-card">
              <div className="roadmap-card-top">
                <div className="roadmap-card-icon"><Map size={20} /></div>
                <span className={`status ${roadmap.status.toLowerCase()}`}>{roadmap.status}</span>
              </div>
              <div className="roadmap-card-main">
                <h2>{roadmap.title}</h2>
                <p>{roadmap.summary}</p>
              </div>
              <div className="tag-row roadmap-focus-row">
                {roadmap.focusAreas.slice(0, 5).map((area) => <span key={area}>{area}</span>)}
                {roadmap.focusAreas.length > 5 ? <span>+{roadmap.focusAreas.length - 5}</span> : null}
              </div>
              <div className="roadmap-meta">
                <span><CalendarDays size={15} /> {roadmap.timelineDays} days</span>
                <span><Clock3 size={15} /> {roadmap.dailyStudyHours}h/day</span>
              </div>
            </Card>
          </Link>
        ))}
        {!loading && !roadmaps.length ? (
          <Card className="roadmap-empty-card">
            <div className="empty-state">No roadmaps yet. Generate your first AI plan.</div>
            <Link className="btn-primary" to="/ai-planner"><Plus size={18} /> Build Roadmap</Link>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
