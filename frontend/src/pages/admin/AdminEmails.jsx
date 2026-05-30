import { RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import { adminApi } from "../../services/adminApi";
import { formatDateTime } from "../../utils/format";

export default function AdminEmails() {
  const [emails, setEmails] = useState([]);
  const [filters, setFilters] = useState({ status: "", emailType: "" });
  const [message, setMessage] = useState("");

  function load() {
    adminApi.emails({ ...filters, limit: 50 }).then((response) => setEmails(response.data.data.emails));
  }

  useEffect(load, [filters]);

  async function retry(id) {
    await adminApi.retryEmail(id);
    setMessage("Email retry triggered.");
    load();
  }

  return (
    <div className="page">
      <header className="page-header"><div><p className="eyebrow">Mail operations</p><h1>Email Logs</h1></div></header>
      {message ? <div className="alert soft">{message}</div> : null}
      <Card className="filters">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option><option>Sent</option><option>Failed</option><option>Skipped</option></select>
        <select value={filters.emailType} onChange={(e) => setFilters({ ...filters, emailType: e.target.value })}><option value="">All types</option><option>Morning Reminder</option><option>Night Report</option><option>Weekly Report</option></select>
      </Card>
      <Card><div className="report-table-wrap"><table className="report-table admin-table">
        <thead><tr><th>Type</th><th>User</th><th>Subject</th><th>Status</th><th>Sent</th><th></th></tr></thead>
        <tbody>{emails.map((email) => <tr key={email._id}>
          <td>{email.emailType}</td>
          <td>{email.userId?.name || email.recipientEmail}</td>
          <td>{email.subject}<br /><span>{email.errorMessage}</span></td>
          <td><span className={`mini-badge status-${email.status?.toLowerCase()}`}>{email.status}</span></td>
          <td>{formatDateTime(email.sentAt || email.createdAt)}</td>
          <td>{email.status !== "Sent" ? <button className="icon-button" onClick={() => retry(email._id)} title="Retry"><RotateCw size={16} /></button> : null}</td>
        </tr>)}</tbody>
      </table></div></Card>
    </div>
  );
}
