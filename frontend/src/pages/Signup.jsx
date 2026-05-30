import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../services/api";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    targetRole: "MERN Stack Developer",
    dailyStudyHoursGoal: 3,
    placementTargetDate: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <p className="eyebrow">Start strong</p>
      <h1>Create account</h1>
      {error ? <div className="alert">{error}</div> : null}
      <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
      <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
      <label>Password<input type="password" minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
      <label>Target role<input value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} /></label>
      <label>Daily study goal<input type="number" min="1" value={form.dailyStudyHoursGoal} onChange={(e) => setForm({ ...form, dailyStudyHoursGoal: Number(e.target.value) })} /></label>
      <label>Placement target date<input type="date" value={form.placementTargetDate} onChange={(e) => setForm({ ...form, placementTargetDate: e.target.value })} /></label>
      <button className="btn-primary" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
      <p className="muted">Already registered? <Link to="/login">Login</Link></p>
    </form>
  );
}
