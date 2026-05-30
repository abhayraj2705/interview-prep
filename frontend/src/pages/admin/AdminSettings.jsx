import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import { adminApi } from "../../services/adminApi";

function HealthItem({ label, ok, detail }) {
  return (
    <div className="health-item">
      {ok ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
      <div><strong>{label}</strong><span>{detail}</span></div>
    </div>
  );
}

export default function AdminSettings() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    adminApi.systemHealth().then((response) => setHealth(response.data.data));
  }, []);

  if (!health) return <div className="screen-center">Checking system health...</div>;

  return (
    <div className="page">
      <header className="page-header"><div><p className="eyebrow">System health</p><h1>Settings & Configuration</h1></div></header>
      <Card className="health-grid">
        <HealthItem label="MongoDB" ok={health.mongo.connected} detail={`Ready state ${health.mongo.readyState}`} />
        <HealthItem label="Gemini AI" ok={health.gemini.configured} detail={health.gemini.model} />
        <HealthItem label="Cloudinary" ok={health.cloudinary.configured} detail="Profile photo uploads" />
        <HealthItem label="Email" ok={health.email.configured} detail={health.email.host || "Not configured"} />
        <HealthItem label="Cron Timezone" ok detail={health.cron.timezone} />
        <HealthItem label="Environment" ok detail={health.environment} />
      </Card>
    </div>
  );
}
