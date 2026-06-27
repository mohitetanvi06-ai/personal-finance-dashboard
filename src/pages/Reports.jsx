import Layout from "../components/Layout";
import ChartCard from "../components/ChartCard";

import { useContext } from "react";
import { FinanceContext } from "../context/FinanceContext";

function Reports() {
  const { income, expense } = useContext(FinanceContext);

  const totalIncome = income.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalExpense = expense.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const savings = totalIncome - totalExpense;

  return (
    <Layout>
      <h2 className="mb-4">Reports</h2>

      <div className="row">

        <div className="col-md-4 mb-3">
          <div className="card bg-success text-white shadow">
            <div className="card-body">
              <h5>Total Income</h5>
              <h3>₹ {totalIncome}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card bg-danger text-white shadow">
            <div className="card-body">
              <h5>Total Expense</h5>
              <h3>₹ {totalExpense}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card bg-primary text-white shadow">
            <div className="card-body">
              <h5>Total Savings</h5>
              <h3>₹ {savings}</h3>
            </div>
          </div>
        </div>

      </div>

      <ChartCard income={income} expense={expense} />

    </Layout>
  );
}

export default Reports;