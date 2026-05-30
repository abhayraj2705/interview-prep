import Card from "./Card.jsx";

export default function StatCard({ title, value, detail, icon: Icon }) {
  return (
    <Card className="stat-card">
      <div className="stat-icon">{Icon ? <Icon size={20} /> : null}</div>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        {detail ? <span>{detail}</span> : null}
      </div>
    </Card>
  );
}
