import "./DashboardCard.css";

function DashboardCard({ title, amount, bgColor, icon, subtitle }) {
  const formattedAmount = Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

  return (
    <article className={`finance-card ${bgColor || ""}`}>
      <div className="finance-card-heading">
        <p className="finance-card-title">{title}</p>
        <div className="finance-card-icon" aria-hidden="true">{icon}</div>
      </div>
      <h3 className="finance-card-amount">₹{formattedAmount}</h3>
      <div className="finance-card-footer">
        <span className="finance-card-trend" aria-hidden="true">↗</span>
        <span className="finance-card-subtitle">{subtitle}</span>
      </div>
      <div className="finance-card-sparkline" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </article>
  );
}

export default DashboardCard;
