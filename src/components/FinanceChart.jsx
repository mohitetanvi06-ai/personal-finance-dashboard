import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function parseTransactionDate(value) {
  if (!value) return null;
  const isoDate = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(value));
  if (isoDate) {
    return new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
  }

  const localDate = /^(\d{1,2})[/. -](\d{1,2})[/. -](\d{2,4})$/.exec(String(value).trim());
  if (localDate) {
    const first = Number(localDate[1]);
    const second = Number(localDate[2]);
    const yearValue = Number(localDate[3]);
    const year = yearValue < 100 ? 2000 + yearValue : yearValue;
    const day = first > 12 ? first : second > 12 ? second : first;
    const month = first > 12 ? second : second > 12 ? first : first > 12 ? second : second;
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const formatAmount = (amount) =>
  `₹ ${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

function FinanceChart({ income = [], expense = [] }) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString("en-IN", { month: "short" }),
      income: 0,
      expense: 0,
    };
  });
  const monthIndex = new Map(months.map((month, index) => [month.key, index]));

  [
    ...income.map((item) => ({ ...item, type: "income" })),
    ...expense.map((item) => ({ ...item, type: "expense" })),
  ].forEach((item) => {
    const date = parseTransactionDate(item.date);
    if (!date) return;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const index = monthIndex.get(key);
    if (index === undefined) return;
    months[index][item.type] += Number(item.amount || 0);
  });

  const data = {
    labels: months.map((month) => month.label),
    datasets: [
      {
        label: "Income",
        data: months.map((month) => month.income),
        backgroundColor: "#743cff",
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.72,
        categoryPercentage: 0.7,
      },
      {
        label: "Expenses",
        data: months.map((month) => month.expense),
        backgroundColor: "#ff474f",
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.72,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "start",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 7,
          boxHeight: 7,
          padding: 18,
          color: "#747b91",
          font: { size: 13, weight: "600" },
        },
      },
      tooltip: {
        callbacks: { label: (context) => `${context.dataset.label}: ${formatAmount(context.raw)}` },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: "rgba(123, 132, 157, 0.14)", drawTicks: false, borderDash: [4, 4] },
        ticks: {
          color: "#8990a2",
          padding: 9,
          font: { size: 13 },
          callback: (value) => {
            const amount = Number(value);
            if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)}L`;
            if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`;
            return `₹${amount}`;
          },
        },
      },
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: { color: "#747b91", font: { size: 13, weight: "600" } },
      },
    },
  };

  return (
    <section className="dashboard-panel dashboard-earnings-panel">
      <div className="dashboard-panel-heading">
        <div>
          <h4>Earnings</h4>
          <p>Monthly income compared with expenses.</p>
        </div>
        <span className="dashboard-period-label">LAST 6 MONTHS</span>
      </div>
      <div className="dashboard-chart-container">
        <Bar data={data} options={options} />
      </div>
    </section>
  );
}

export default FinanceChart;
