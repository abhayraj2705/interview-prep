import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import { adminApi } from "../../services/adminApi";
import { formatDateTime } from "../../utils/format";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    adminApi.auditLogs({ limit: 50 }).then((response) => setLogs(response.data.data.logs));
  }, []);

  return (
    <div className="page">
      <header className="page-header"><div><p className="eyebrow">Admin security</p><h1>Audit Logs</h1></div></header>
      <Card><div className="report-table-wrap"><table className="report-table admin-table">
        <thead><tr><th>Action</th><th>Admin</th><th>Entity</th><th>Message</th><th>Time</th></tr></thead>
        <tbody>{logs.map((log) => <tr key={log._id}>
          <td>{log.action}</td>
          <td>{log.adminId?.name || "Admin"}</td>
          <td>{log.entityType}</td>
          <td>{log.message}</td>
          <td>{formatDateTime(log.createdAt)}</td>
        </tr>)}</tbody>
      </table></div></Card>
    </div>
  );
}
