import { Flame, Gift, Lock, Medal, Sparkles, Trophy, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import Card from "../components/ui/Card.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import { rewardApi } from "../services/rewardApi";

const levels = [
  { min: 0, name: "Level 1", title: "Beginner Candidate" },
  { min: 500, name: "Level 2", title: "Consistent Learner" },
  { min: 1500, name: "Level 3", title: "Interview Grinder" },
  { min: 3000, name: "Level 4", title: "Placement Warrior" },
  { min: 5000, name: "Level 5", title: "Offer Ready" }
];

function getLevelProgress(points = 0) {
  const currentIndex = levels.reduce((matchIndex, level, index) => (points >= level.min ? index : matchIndex), 0);
  const current = levels[Math.max(currentIndex, 0)];
  const next = levels[currentIndex + 1];
  if (!next) return { current, next: null, progress: 100, remaining: 0 };
  const progress = Math.round(((points - current.min) / (next.min - current.min)) * 100);
  return { current, next, progress: Math.max(0, Math.min(progress, 100)), remaining: next.min - points };
}

export default function Rewards() {
  const [reward, setReward] = useState(null);
  const [badges, setBadges] = useState({ unlocked: [], locked: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([rewardApi.get(), rewardApi.badges()])
      .then(([rewardResponse, badgeResponse]) => {
        setReward(rewardResponse.data.data.reward);
        setBadges(badgeResponse.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalPoints = reward?.totalPoints || 0;
  const level = getLevelProgress(totalPoints);
  const totalBadges = badges.unlocked.length + badges.locked.length;
  const badgeProgress = totalBadges ? Math.round((badges.unlocked.length / totalBadges) * 100) : 0;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Motivation system</p>
          <h1>Rewards</h1>
          <p className="page-subtitle">Track your XP, streaks, and placement-prep milestones as you keep showing up.</p>
        </div>
      </header>

      <Card className="reward-hero">
        <div className="reward-level-orb">
          <Sparkles size={28} />
          <strong>{level.current.name}</strong>
          <span>{totalPoints} XP</span>
        </div>
        <div className="reward-hero-main">
          <p className="eyebrow">Current rank</p>
          <h2>{level.current.title}</h2>
          <p>
            {level.next
              ? `${level.remaining} XP left to reach ${level.next.title}.`
              : "You are at the highest reward level. Keep stacking clean preparation days."}
          </p>
          <div className="reward-level-track">
            <span style={{ width: `${level.progress}%` }} />
          </div>
          <div className="reward-level-meta">
            <span>{level.current.name}</span>
            <strong>{level.progress}%</strong>
            <span>{level.next?.name || "Max"}</span>
          </div>
        </div>
        <div className="reward-hero-side">
          <span>Badges collected</span>
          <strong>{badges.unlocked.length}/{totalBadges || 0}</strong>
          <div className="mini-progress"><span style={{ width: `${badgeProgress}%` }} /></div>
        </div>
      </Card>

      <section className="stats-grid reward-stats-grid">
        {loading ? Array.from({ length: 3 }, (_, index) => (
          <Card className="stat-card skeleton-card" key={index}>
            <div className="stat-icon" />
            <div>
              <div className="skeleton-line" />
              <div className="skeleton-line wide" />
            </div>
          </Card>
        )) : (
          <>
        <StatCard title="Total XP" value={totalPoints} detail={reward?.currentLevel || "Level 1"} icon={Gift} />
        <StatCard title="Current Streak" value={`${reward?.currentStreak || 0} days`} detail="Keep it alive" icon={Flame} />
        <StatCard title="Longest Streak" value={`${reward?.longestStreak || 0} days`} detail="Personal best" icon={Trophy} />
          </>
        )}
      </section>

      <Card className="reward-section">
        <div className="section-title"><h2>Unlocked Badges</h2><Medal size={18} /></div>
        <div className="badge-grid">
          {badges.unlocked.map((badge) => (
            <div className="badge unlocked" key={badge.name}>
              <div className="badge-icon"><Medal size={20} /></div>
              <strong>{badge.name}</strong>
              <span>{badge.description}</span>
              <small>{badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Unlocked"}</small>
            </div>
          ))}
          {!badges.unlocked.length ? <div className="empty-state">Complete tasks to unlock badges.</div> : null}
        </div>
      </Card>

      <Card className="reward-section">
        <div className="section-title"><h2>Locked Badges</h2><Lock size={18} /></div>
        <div className="badge-grid">
          {badges.locked.map((badge) => (
            <div className="badge" key={badge.name}>
              <div className="badge-icon locked"><Lock size={20} /></div>
              <strong>{badge.name}</strong>
              <span>{badge.description}</span>
              <small><Zap size={12} /> Keep progressing</small>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
