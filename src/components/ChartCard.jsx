import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function ChartCard({ income, expense }) {
  // Total Income
  const totalIncome = income.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  // Total Expense
  const totalExpense = expense.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  // Group expenses by category
  const categoryData = {};

  expense.forEach((item) => {
    categoryData[item.category] =
      (categoryData[item.category] || 0) + item.amount;
  });

  const barData = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        label: "Amount",
        data: [totalIncome, totalExpense],
        backgroundColor: ["#198754", "#dc3545"],
      },
    ],
  };

  const pieData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          "#0d6efd",
          "#198754",
          "#ffc107",
          "#dc3545",
          "#6f42c1",
          "#20c997",
          "#fd7e14",
        ],
      },
    ],
  };

  return (
    <div className="row mt-4">
      <div className="col-lg-6 mb-4">
        <div className="card shadow p-3">
          <h5>Income vs Expense</h5>
          <Bar data={barData} />
        </div>
      </div>

      <div className="col-lg-6 mb-4">
        <div className="card shadow p-3">
          <h5>Expense Categories</h5>
          {expense.length === 0 ? (
            <p className="text-center mt-5">No Expense Data</p>
          ) : (
            <Pie data={pieData} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ChartCard;