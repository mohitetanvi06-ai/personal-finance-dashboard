import {
  ArcElement,
  Chart as ChartJS,
  Tooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip);

const COLORS = ["#ff474f", "#ffc941", "#ff896d", "#743cff", "#2878ff", "#19b887"];

const formatMoney = (amount) =>
  `₹ ${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

function ExpenseBreakdown({ expense = [] }) {
  const categories = expense.reduce((totals, item) => {
    const category = String(item.category || "Other").trim() || "Other";
    totals[category] = (totals[category] || 0) + Number(item.amount || 0);
    return totals;
  }, {});
  const entries = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  const totalExpense = entries.reduce((sum, [, amount]) => sum + amount, 0);

  const data = {
    labels: entries.map(([category]) => category),
    datasets: [{
      data: entries.map(([, amount]) => amount),
      backgroundColor: entries.map((_, index) => COLORS[index % COLORS.length]),
      borderWidth: 0,
      hoverOffset: 5,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${formatMoney(context.raw)}`,
        },
      },
    },
  };

  return (
    <section className="dashboard-panel dashboard-category-panel">
      <div className="dashboard-panel-heading">
        <div>
          <h4>Expense by Category</h4>
          <p>See where your money is going.</p>
        </div>
        <span className="dashboard-period-label">ALL TIME</span>
      </div>

      {entries.length === 0 ? (
        <div className="dashboard-chart-empty">
          Add expenses to see your category breakdown.
        </div>
      ) : (
        <div className="dashboard-category-content">
          <div className="dashboard-doughnut-wrap">
            <Doughnut data={data} options={options} />
            <div className="dashboard-doughnut-total">
              <span>Total spend</span>
              <strong>{formatMoney(totalExpense)}</strong>
            </div>
          </div>
          <ul className="dashboard-category-legend">
            {entries.map(([category, amount], index) => (
              <li key={category}>
                <span
                  className="dashboard-legend-dot"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="dashboard-legend-name">{category}</span>
                <strong>{formatMoney(amount)}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default ExpenseBreakdown;
