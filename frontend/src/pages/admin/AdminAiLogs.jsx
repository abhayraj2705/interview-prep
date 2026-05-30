import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import { adminApi } from "../../services/adminApi";
import { formatDateTime } from "../../utils/format";

export default function AdminAiLogs() {
  const [items, setItems] = useState([]);
  const [type, setType] = useState("");

  useEffect(() => {
    adminApi.aiPlans({ type, limit: 30 }).then((response) => setItems(response.data.data.aiPlans));
  }, [type]);

  return (
    <div className="page">
      <header className="page-header"><div><p className="eyebrow">AI operations</p><h1>AI Generation Logs</h1></div></header>
      <Card className="filters"><select value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option><option>DailySuggestion</option><option>Questionnaire</option><option>WeaknessAnalysis</option><option>Replan</option></select></Card>
      <div className="admin-log-list">
        {items.map((item) => (
          <Card className="admin-log-card" key={item._id}>
            <div className="section-title"><h2>{item.type}</h2><span>{formatDateTime(item.createdAt)}</span></div>
            <p className="muted">{item.userId?.name || "Unknown"} - {item.output?.aiProvider || "AI"}</p>
            <details>
              <summary>View input/output snapshot</summary>
              <pre>{JSON.stringify({ input: item.inputSnapshot, output: item.output }, null, 2)}</pre>
            </details>
          </Card>
        ))}
      </div>
    </div>
  );
}
