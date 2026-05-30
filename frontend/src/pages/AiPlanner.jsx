import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import { getErrorMessage } from "../services/api";
import { aiApi } from "../services/aiApi";
import { roadmapApi } from "../services/roadmapApi";

const focusOptions = ["DSA", "Core CS", "DBMS", "OS", "CN", "OOP", "MERN Stack", "React", "Node.js", "MongoDB", "Aptitude", "Resume", "HR Preparation", "Mock Interview"];

const initialForm = {
  goalTitle: "Placement Preparation Roadmap",
  focusAreas: ["DSA"],
  timelineDays: 60,
  dailyStudyHours: 4,
  intensity: "Balanced",
  targetRole: "Software Developer",
  startDate: new Date().toISOString().slice(0, 10)
};

export default function AiPlanner() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  function toggleFocus(area) {
    setForm((current) => ({
      ...current,
      focusAreas: current.focusAreas.includes(area)
        ? current.focusAreas.filter((item) => item !== area)
        : [...current.focusAreas, area]
    }));
    setRoadmap(null);
  }

  function toggleMultiAnswer(questionId, option) {
    setAnswers((current) => {
      const existing = Array.isArray(current[questionId]) ? current[questionId] : [];
      return {
        ...current,
        [questionId]: existing.includes(option) ? existing.filter((item) => item !== option) : [...existing, option]
      };
    });
  }

  async function generateQuestions() {
    if (!form.focusAreas.length) {
      setError("Select at least one focus area before generating questions.");
      return;
    }
    setLoading("questions");
    setError("");
    try {
      const response = await aiApi.questionnaire(form);
      setQuestions(response.data.data.questions || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading("");
    }
  }

  async function generateRoadmap() {
    if (!form.focusAreas.length) {
      setError("Select at least one focus area before generating a roadmap.");
      return;
    }
    setLoading("roadmap");
    setError("");
    try {
      const questionnaire = questions.map((question) => ({
        questionId: question.id,
        question: question.question,
        answer: Array.isArray(answers[question.id]) ? answers[question.id].join(", ") : answers[question.id] || ""
      }));
      const response = await roadmapApi.generate({ ...form, questionnaire });
      setRoadmap(response.data.data.roadmap);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading("");
    }
  }

  async function convertFullRoadmap() {
    const response = await roadmapApi.convertToTasks(roadmap._id, { mode: "all" });
    const createdCount = response.data.data.createdTasks.length;
    navigate(`/tasks?roadmapId=${roadmap._id}&source=Roadmap&imported=${createdCount}`);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">AI placement planner</p>
          <h1>Build a Day-Wise Roadmap</h1>
          <p className="page-subtitle">Select your preparation areas, answer AI questions, then generate a realistic task schedule.</p>
        </div>
      </header>

      {error ? <div className="alert">{error}</div> : null}

      <Card className="planner-card">
        <div className="section-title"><h2>1. Goal Setup</h2><span>Tell AI what you want to finish</span></div>
        <div className="form-grid">
          <label>Goal title<input value={form.goalTitle} onChange={(e) => setForm({ ...form, goalTitle: e.target.value })} /></label>
          <label>Timeline days<input type="number" min="1" max="120" value={form.timelineDays} onChange={(e) => setForm({ ...form, timelineDays: Number(e.target.value) })} /></label>
          <label>Daily hours<input type="number" min="1" max="12" value={form.dailyStudyHours} onChange={(e) => setForm({ ...form, dailyStudyHours: Number(e.target.value) })} /></label>
          <label>Intensity<select value={form.intensity} onChange={(e) => setForm({ ...form, intensity: e.target.value })}><option>Light</option><option>Balanced</option><option>Aggressive</option></select></label>
          <label>Target role<input value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} /></label>
          <label>Start date<input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label>
        </div>
        <div className="chip-grid">
          {focusOptions.map((area) => (
            <button key={area} type="button" className={`chip ${form.focusAreas.includes(area) ? "selected" : ""}`} onClick={() => toggleFocus(area)}>
              {form.focusAreas.includes(area) ? <Check size={14} /> : null}{area}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={generateQuestions} disabled={loading === "questions"}>
          <Sparkles size={18} /> {loading === "questions" ? "Generating..." : "Generate AI Questions"}
        </button>
      </Card>

      {questions.length ? (
        <Card className="planner-card">
          <div className="section-title"><h2>2. Answer Questions</h2><span>These personalize the roadmap</span></div>
          <div className="question-list">
            {questions.map((question) => (
              <label key={question.id}>
                {question.question}
                {question.type === "text" || !question.options?.length ? (
                  <input value={answers[question.id] || ""} onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })} />
                ) : question.type === "multi_choice" ? (
                  <div className="chip-grid">
                    {question.options.map((option) => (
                      <button
                        type="button"
                        key={option}
                        className={`chip ${Array.isArray(answers[question.id]) && answers[question.id].includes(option) ? "selected" : ""}`}
                        onClick={() => toggleMultiAnswer(question.id, option)}
                      >
                        {Array.isArray(answers[question.id]) && answers[question.id].includes(option) ? <Check size={14} /> : null}
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <select value={answers[question.id] || ""} onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}>
                    <option value="">Choose answer</option>
                    {question.options.map((option) => <option key={option}>{option}</option>)}
                  </select>
                )}
              </label>
            ))}
          </div>
          <button className="btn-primary" onClick={generateRoadmap} disabled={loading === "roadmap"}>
            <ArrowRight size={18} /> {loading === "roadmap" ? "Creating Roadmap..." : "Generate Roadmap"}
          </button>
        </Card>
      ) : null}

      {roadmap ? (
        <Card className="planner-card">
          <div className="section-title">
            <div>
              <h2>{roadmap.title}</h2>
              <span>{roadmap.timelineDays} days - {roadmap.dailyStudyHours} hours/day - {roadmap.intensity}</span>
            </div>
          </div>
          <p className="muted">{roadmap.summary}</p>
          <div className="roadmap-preview-days">
            {roadmap.days.slice(0, 5).map((day) => (
              <div className="roadmap-day-mini" key={day._id}>
                <strong>Day {day.dayNumber}: {day.theme}</strong>
                <span>{new Date(day.date).toLocaleDateString()}</span>
                <ul>{day.tasks.slice(0, 3).map((task) => <li key={task._id || task.title}>{task.title}</li>)}</ul>
              </div>
            ))}
          </div>
          <div className="button-row">
            <button className="btn-primary" onClick={convertFullRoadmap}>Convert Full Roadmap To Tasks</button>
            <button className="btn-secondary" onClick={() => navigate(`/roadmaps/${roadmap._id}`)}>Open Roadmap</button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
