import { Bot, Lightbulb, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { getErrorMessage } from "../../services/api";
import { aiApi } from "../../services/aiApi";
import { taskApi } from "../../services/taskApi";
import Card from "../ui/Card.jsx";

const categories = new Set([
  "DSA",
  "MERN Stack",
  "JavaScript",
  "React",
  "Node.js",
  "MongoDB",
  "Core CS",
  "DBMS",
  "Operating System",
  "Computer Networks",
  "OOP",
  "System Design",
  "Cybersecurity",
  "Aptitude",
  "Resume",
  "HR Preparation",
  "Mock Interview",
  "Other"
]);

function textValue(value, fallback = "") {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((item) => textValue(item)).filter(Boolean).join(", ");
  if (value && typeof value === "object") {
    return textValue(value.title || value.description || value.reason || value.category || value.name, fallback);
  }
  return fallback;
}

function numberValue(value, fallback = 45) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value.replace(/[^\d.]/g, "")) || fallback;
  if (value && typeof value === "object") return numberValue(value.estimatedTimeMinutes || value.minutes || value.duration, fallback);
  return fallback;
}

function normalizeSuggestion(item, index) {
  const task = item && typeof item === "object" && !Array.isArray(item) ? item : {};
  const category = textValue(task.category, "Other");
  const difficulty = textValue(task.difficulty, "Medium");
  const priority = textValue(task.priority, "Medium");
  return {
    title: textValue(task.title, `AI preparation task ${index + 1}`),
    description: textValue(task.description),
    reason: textValue(task.reason, "Recommended by AI for today's preparation."),
    category: categories.has(category) ? category : "Other",
    difficulty: ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty : "Medium",
    priority: ["Low", "Medium", "High", "Critical"].includes(priority) ? priority : "Medium",
    estimatedTimeMinutes: Math.max(15, Math.min(numberValue(task.estimatedTimeMinutes), 180))
  };
}

export default function DailySuggestionPanel() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function generate() {
    setLoading(true);
    setMessage("");
    try {
      const response = await aiApi.dailySuggestions();
      setSuggestions((response.data.data.suggestions || []).map(normalizeSuggestion));
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function addTask(suggestion) {
    const task = normalizeSuggestion(suggestion, 0);
    await taskApi.create({
      ...task,
      dueDate: new Date().toISOString(),
      status: "Pending",
      source: { type: "AI Suggestion" }
    });
    setMessage("Suggestion added to today's tasks.");
  }

  async function addAll() {
    for (const suggestion of suggestions) {
      await addTask(suggestion);
    }
    setMessage("All AI suggestions added to today's tasks.");
  }

  return (
    <Card className="ai-suggestion-card">
      <div className="section-title">
        <div>
          <h2>AI Suggestions For Today</h2>
          <span>Generate tasks from your weak areas, pending work, and study goal.</span>
        </div>
        <button className="btn-primary" onClick={generate} disabled={loading}>
          <Sparkles size={18} /> {loading ? "Thinking..." : "Generate"}
        </button>
      </div>
      {message ? <div className="alert soft">{message}</div> : null}

      {loading ? (
        <div className="ai-suggestion-loading">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="ai-suggestion skeleton-card" key={index}>
              <div className="ai-suggestion-icon" />
              <div>
                <div className="skeleton-line wide" />
                <div className="skeleton-line" />
                <div className="skeleton-chip-row">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : suggestions.length ? (
        <>
          <div className="ai-suggestion-list">
            {suggestions.map((item, index) => (
              <div className="ai-suggestion" key={`${item.title}-${index}`}>
                <div className="ai-suggestion-icon"><Bot size={18} /></div>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.reason || item.description}</p>
                  <div className="tag-row">
                    <span>{item.category}</span>
                    <span>{item.priority}</span>
                    <span>{item.difficulty}</span>
                    <span>{item.estimatedTimeMinutes} min</span>
                  </div>
                </div>
                <button className="icon-button" onClick={() => addTask(item)} title="Add task">
                  <Plus size={18} />
                </button>
              </div>
            ))}
          </div>
          <button className="btn-secondary ai-add-all" onClick={addAll}>Add All Suggestions</button>
        </>
      ) : (
        <div className="ai-empty-state">
          <div className="ai-suggestion-icon"><Lightbulb size={18} /></div>
          <div>
            <strong>No AI tasks generated yet</strong>
            <p>Click generate to create a focused set for today from your roadmap, pending tasks, and study goal.</p>
          </div>
        </div>
      )}
    </Card>
  );
}
