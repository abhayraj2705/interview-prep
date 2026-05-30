import { ArrowRight, BarChart3, Flame, Gift, MailCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <strong>Reward Todo</strong>
        <div>
          <Link to="/login">Login</Link>
          <Link className="btn-primary" to="/signup">Start</Link>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Interview preparation dashboard</p>
          <h1>Prepare for placements with discipline, rewards, and daily progress tracking.</h1>
          <p>
            Plan your DSA, MERN, aptitude, resume, and mock interview work in one focused dashboard with XP, streaks,
            reports, and daily email reminders.
          </p>
          <Link className="btn-primary hero-action" to="/signup">
            Start preparation <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <section className="feature-grid">
        {[
          ["Daily Focus", "Create and complete interview prep tasks by category.", Flame],
          ["Reward System", "Earn XP, levels, badges, and streak momentum.", Gift],
          ["Analytics", "Spot weak areas and track weekly improvement.", BarChart3],
          ["Email Reports", "Get morning plans and night performance reports.", MailCheck]
        ].map(([title, text, Icon]) => (
          <article className="card feature-card" key={title}>
            <Icon />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
