import { Check, Edit3, Mail, Map, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../components/ui/Card.jsx";
import { getErrorMessage } from "../services/api";
import { taskApi } from "../services/taskApi";
import { categories, difficulties, priorities, statuses } from "../utils/options";

const initialForm = {
  title: "",
  description: "",
  category: "DSA",
  difficulty: "Medium",
  priority: "Medium",
  estimatedTimeMinutes: 30,
  actualTimeMinutes: 0,
  dueDate: new Date().toISOString().slice(0, 10),
  status: "Pending"
};

export default function Tasks() {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ category: "", status: "", priority: "" });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingAll, setDeletingAll] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  const roadmapId = searchParams.get("roadmapId");
  const importedCount = searchParams.get("imported");
  const source = searchParams.get("source");
  const activeFilters = useMemo(
    () => ({
      ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
      ...(roadmapId ? { roadmapId } : {}),
      ...(source ? { source } : {})
    }),
    [filters, roadmapId, source]
  );

  function taskMatchesFilters(task, scopedFilters = activeFilters) {
    if (scopedFilters.category && task.category !== scopedFilters.category) return false;
    if (scopedFilters.status && task.status !== scopedFilters.status) return false;
    if (scopedFilters.priority && task.priority !== scopedFilters.priority) return false;
    if (scopedFilters.source && task.source?.type !== scopedFilters.source) return false;
    if (scopedFilters.roadmapId && String(task.source?.roadmapId) !== String(scopedFilters.roadmapId)) return false;
    return true;
  }

  function sortTasks(items) {
    return [...items].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  async function loadTasks({ showLoading = true } = {}) {
    if (showLoading) setLoading(true);
    const response = await taskApi.list(activeFilters);
    setTasks(response.data.data.tasks);
    if (showLoading) setLoading(false);
  }

  useEffect(() => {
    loadTasks().catch((err) => {
      setError(getErrorMessage(err));
      setLoading(false);
    });
  }, [activeFilters.category, activeFilters.status, activeFilters.priority, activeFilters.roadmapId, activeFilters.source]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    const payload = { ...form, dueDate: new Date(form.dueDate).toISOString() };
    try {
      if (editingId) {
        const response = await taskApi.update(editingId, payload);
        const updatedTask = response.data.data.task;
        setTasks((current) =>
          taskMatchesFilters(updatedTask)
            ? sortTasks(current.map((task) => (task._id === editingId ? updatedTask : task)))
            : current.filter((task) => task._id !== editingId)
        );
      } else {
        const response = await taskApi.create(payload);
        const createdTask = response.data.data.task;
        if (taskMatchesFilters(createdTask)) {
          setTasks((current) => sortTasks([createdTask, ...current]));
        }
      }
      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.status === 404 ? "That task no longer exists. The list has been refreshed." : getErrorMessage(err));
      if (err.response?.status === 404) {
        setForm(initialForm);
        setEditingId(null);
        setShowForm(false);
        await loadTasks({ showLoading: false }).catch(() => null);
      }
    }
  }

  function editTask(task) {
    setEditingId(task._id);
    setForm({ ...task, dueDate: new Date(task.dueDate).toISOString().slice(0, 10) });
    setShowForm(true);
  }

  async function runTaskAction(action, fallbackMessage = "Task action failed") {
    setError("");
    setMessage("");
    try {
      return await action();
    } catch (err) {
      const message = getErrorMessage(err);
      setError(err.response?.status === 404 ? "That task no longer exists. The list has been refreshed." : message || fallbackMessage);
      await loadTasks({ showLoading: false }).catch(() => null);
      return null;
    }
  }

  async function completeTask(task) {
    const previousTasks = tasks;
    setTasks((current) =>
      taskMatchesFilters({ ...task, status: "Completed" })
        ? current.map((item) => (item._id === task._id ? { ...item, status: "Completed", completedAt: new Date().toISOString() } : item))
        : current.filter((item) => item._id !== task._id)
    );
    const response = await runTaskAction(
      () => taskApi.complete(task._id, { actualTimeMinutes: task.actualTimeMinutes || task.estimatedTimeMinutes || 0 }),
      "Could not complete task"
    );
    if (!response) {
      setTasks(previousTasks);
      return;
    }
    const completedTask = response.data.data.task;
    setTasks((current) =>
      taskMatchesFilters(completedTask)
        ? sortTasks(current.map((item) => (item._id === completedTask._id ? completedTask : item)))
        : current.filter((item) => item._id !== completedTask._id)
    );
  }

  async function deleteTask(id) {
    setError("");
    setMessage("");
    const previousTasks = tasks;
    setTasks((current) => current.filter((task) => task._id !== id));
    try {
      await taskApi.remove(id);
    } catch (err) {
      setTasks(previousTasks);
      setError(err.response?.status === 404 ? "That task was already deleted." : getErrorMessage(err) || "Could not delete task");
    }
  }

  async function deleteAllTasks() {
    if (!tasks.length) return;
    const scopedMessage = roadmapId || source || filters.category || filters.status || filters.priority ? "matching the current filters" : "in your task list";
    if (!confirm(`Delete all ${tasks.length} tasks ${scopedMessage}? This cannot be undone.`)) return;
    setError("");
    setMessage("");
    setDeletingAll(true);
    const previousTasks = tasks;
    setTasks([]);
    try {
      await taskApi.removeAll(activeFilters);
    } catch (err) {
      setTasks(previousTasks);
      setError(getErrorMessage(err) || "Could not delete all tasks");
    } finally {
      setDeletingAll(false);
    }
  }

  async function sendTodayReminder() {
    setError("");
    setMessage("");
    setSendingReminder(true);
    try {
      const response = await taskApi.sendTodayReminder();
      setMessage(response.data.message || "Today's task reminder email sent.");
    } catch (err) {
      setError(getErrorMessage(err) || "Could not send today's task reminder email.");
    } finally {
      setSendingReminder(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Plan and execute</p>
          <h1>Tasks</h1>
        </div>
        <div className="button-row">
          <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={18} /> Add Task</button>
          <button className="btn-secondary" onClick={sendTodayReminder} disabled={sendingReminder || loading} title="Email today's tasks">
            <Mail size={18} /> {sendingReminder ? "Sending..." : "Email Today"}
          </button>
          <button className="icon-button danger" onClick={deleteAllTasks} disabled={!tasks.length || deletingAll || loading} title="Delete all visible tasks">
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {error ? <div className="alert">{error}</div> : null}
      {message ? <div className="alert soft">{message}</div> : null}

      {roadmapId ? (
        <div className="alert soft imported-banner">
          <Map size={18} />
          <span>
            Showing roadmap-imported tasks{importedCount ? ` (${importedCount} newly added)` : ""}. These tasks include the roadmap day, reason, and completion checklist in the description.
          </span>
        </div>
      ) : null}

      <Card className="filters">
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All categories</option>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          {statuses.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All priorities</option>
          {priorities.map((item) => <option key={item}>{item}</option>)}
        </select>
      </Card>

      {showForm ? (
        <Card>
          <form className="task-form" onSubmit={handleSubmit}>
            <div className="section-title">
              <h2>{editingId ? "Edit Task" : "New Task"}</h2>
              <button type="button" className="icon-button" onClick={() => { setShowForm(false); setEditingId(null); }}><X size={18} /></button>
            </div>
            <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
            <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <div className="form-grid">
              <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Difficulty<select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>{difficulties.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{priorities.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Estimated minutes<input type="number" min="0" value={form.estimatedTimeMinutes} onChange={(e) => setForm({ ...form, estimatedTimeMinutes: Number(e.target.value) })} /></label>
              <label>Actual minutes<input type="number" min="0" value={form.actualTimeMinutes} onChange={(e) => setForm({ ...form, actualTimeMinutes: Number(e.target.value) })} /></label>
              <label>Due date<input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
            </div>
            <button className="btn-primary">{editingId ? "Update Task" : "Create Task"}</button>
          </form>
        </Card>
      ) : null}

      <section className="task-list">
        {loading ? (
          Array.from({ length: 4 }, (_, index) => (
            <Card className="task-row skeleton-card" key={index}>
              <div className="skeleton-line wide" />
              <div className="skeleton-line" />
              <div className="skeleton-chip-row">
                <span />
                <span />
                <span />
              </div>
            </Card>
          ))
        ) : tasks.map((task) => (
          <Card className="task-row" key={task._id}>
            <div className="task-main">
              <div>
                <h2>{task.title}</h2>
                <p>{task.description || "No description"}</p>
                <div className="tag-row">
                  <span>{task.category}</span>
                  <span>{task.difficulty}</span>
                  <span>{task.priority}</span>
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
              <strong className={`status ${task.status.toLowerCase().replaceAll(" ", "-")}`}>{task.status}</strong>
            </div>
            <div className="task-actions">
              {task.status !== "Completed" ? <button className="icon-button" onClick={() => completeTask(task)} title="Complete"><Check size={18} /></button> : null}
              <button className="icon-button" onClick={() => editTask(task)} title="Edit"><Edit3 size={18} /></button>
              <button className="icon-button danger" onClick={() => deleteTask(task._id)} title="Delete"><Trash2 size={18} /></button>
            </div>
          </Card>
        ))}
        {!loading && !tasks.length ? <Card><div className="empty-state">No tasks found.</div></Card> : null}
      </section>
    </div>
  );
}
