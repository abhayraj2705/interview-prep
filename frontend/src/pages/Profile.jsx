import { Camera, Save, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import Card from "../components/ui/Card.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../services/api";

function dateValue(date) {
  return date ? new Date(date).toISOString().slice(0, 10) : "";
}

export default function Profile() {
  const { user, loading, updateProfile } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      targetRole: user.targetRole || "",
      preparationStartDate: dateValue(user.preparationStartDate),
      placementTargetDate: dateValue(user.placementTargetDate),
      dailyStudyHoursGoal: user.dailyStudyHoursGoal || 3,
      profilePhoto: user.profilePhoto || "",
      emailPreferences: {
        morningReminder: user.emailPreferences?.morningReminder ?? true,
        nightReport: user.emailPreferences?.nightReport ?? true,
        weeklyReport: user.emailPreferences?.weeklyReport ?? true
      }
    });
  }, [user]);

  async function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Choose a valid image file.");
      return;
    }
    if (file.size > 500 * 1024) {
      setError("Profile photo must be under 500 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, profilePhoto: reader.result }));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = {
        ...form,
        preparationStartDate: form.preparationStartDate || undefined,
        placementTargetDate: form.placementTargetDate || undefined,
        dailyStudyHoursGoal: Number(form.dailyStudyHoursGoal)
      };
      if (form.profilePhoto === user.profilePhoto) {
        delete payload.profilePhoto;
      }
      await updateProfile(payload);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return (
      <div className="page">
        <Card className="profile-hero skeleton-card">
          <div className="profile-avatar skeleton-avatar" />
          <div className="profile-hero-copy">
            <div className="skeleton-line wide" />
            <div className="skeleton-line" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Preparation profile</p>
          <h1>Profile</h1>
          <p className="page-subtitle">Keep your placement target, study goal, reminders, and profile photo up to date.</p>
        </div>
      </header>

      {message ? <div className="alert soft">{message}</div> : null}
      {error ? <div className="alert">{error}</div> : null}

      <Card className="profile-hero">
        <div className="profile-avatar">
          {form.profilePhoto ? <img src={form.profilePhoto} alt="Profile" /> : <UserRound size={44} />}
        </div>
        <div className="profile-hero-copy">
          <p className="eyebrow">Candidate profile</p>
          <h2>{form.name || "Your Name"}</h2>
          <span>{user.email}</span>
        </div>
        <label className="photo-button">
          <Camera size={18} />
          Change Photo
          <input type="file" accept="image/*" onChange={handlePhoto} />
        </label>
      </Card>

      <Card>
        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Email<input value={user.email} disabled /></label>
            <label>Target role<input value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} /></label>
            <label>Daily study goal<input type="number" min="1" max="12" value={form.dailyStudyHoursGoal} onChange={(e) => setForm({ ...form, dailyStudyHoursGoal: e.target.value })} /></label>
            <label>Preparation start<input type="date" value={form.preparationStartDate} onChange={(e) => setForm({ ...form, preparationStartDate: e.target.value })} /></label>
            <label>Placement target<input type="date" value={form.placementTargetDate} onChange={(e) => setForm({ ...form, placementTargetDate: e.target.value })} /></label>
          </div>

          <div className="profile-toggle-grid">
            {[
              ["morningReminder", "Morning reminder"],
              ["nightReport", "Night performance report"],
              ["weeklyReport", "Weekly report"]
            ].map(([key, label]) => (
              <label className="toggle-row" key={key}>
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={form.emailPreferences[key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      emailPreferences: { ...form.emailPreferences, [key]: e.target.checked }
                    })
                  }
                />
              </label>
            ))}
          </div>

          <button className="btn-primary" disabled={saving}>
            <Save size={18} /> {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </Card>
    </div>
  );
}
