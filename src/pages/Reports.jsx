import { useContext, useState } from "react";
import { FaArrowDown, FaArrowUp, FaChartLine, FaDownload, FaPrint, FaSearch } from "react-icons/fa";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";

import Layout from "../components/Layout";
import { FinanceContext } from "../context/FinanceDataContext";
import { downloadTransactions } from "../utils/financeExports";

import "./Reports.css";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

const CATEGORY_COLORS = ["#7040e8", "#ed5b73", "#f2b544", "#31a5c8", "#37a678", "#8d68df"];

function parseReportDate(value) {
  if (!value) return null;
  const text = String(value).trim();
  const isoDate = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  if (isoDate) {
    return new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
  }

  const numericDate = /^(\d{1,2})[/. -](\d{1,2})[/. -](\d{2,4})$/.exec(text);
  if (numericDate) {
    const first = Number(numericDate[1]);
    const second = Number(numericDate[2]);
    const yearValue = Number(numericDate[3]);
    const year = yearValue < 100 ? 2000 + yearValue : yearValue;
    const day = first;
    const month = second;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1
      ? date
      : null;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const formatMoney = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const transactionTimestamp = (item) =>
  parseReportDate(item.date)?.getTime() || 0;

function Reports() {
  const {
    income = [],
    expense = [],
    savingsGoals: storedGoals = [],
    budgets: storedBudgets = [],
    bills: storedBills = [],
  } = useContext(FinanceContext);
  const [period, setPeriod] = useState("month");
  const [search, setSearch] = useState("");
  const [statementMonth, setStatementMonth] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
  const today = new Date();
  const selectedMonth = /^(\d{4})-(\d{2})$/.exec(statementMonth);
  const selectedMonthDate = selectedMonth
    ? new Date(Number(selectedMonth[1]), Number(selectedMonth[2]) - 1, 1)
    : new Date(today.getFullYear(), today.getMonth(), 1);
  const periodStart = period === "month"
    ? selectedMonthDate
    : new Date(today.getFullYear(), today.getMonth(), 1);
  if (period === "week") {
    periodStart.setDate(today.getDate() - 6);
    periodStart.setHours(0, 0, 0, 0);
  } else if (period === "year") {
    periodStart.setMonth(0, 1);
  } else if (period === "all") {
    periodStart.setFullYear(1970, 0, 1);
  }
  const periodEnd = period === "month"
    ? new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 1)
    : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const inPeriod = (item) => {
    const date = parseReportDate(item.date);
    return date &&
      date >= periodStart &&
      date < periodEnd;
  };
  const periodIncome = income.filter(inPeriod);
  const periodExpenses = expense.filter(inPeriod);
  const totalIncome = periodIncome.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpense = periodExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0
    ? Math.round((netSavings / totalIncome) * 100)
    : 0;
  const insightMonth = period === "month"
    ? periodStart
    : new Date(today.getFullYear(), today.getMonth(), 1);
  const insightMonthLabel = insightMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const currentMonthIncome = income
    .filter((item) => {
      const date = parseReportDate(item.date);
      return date && date.getFullYear() === insightMonth.getFullYear() &&
        date.getMonth() === insightMonth.getMonth();
    })
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const currentMonthExpenses = expense.filter((item) => {
    const date = parseReportDate(item.date);
    return date && date.getFullYear() === insightMonth.getFullYear() &&
      date.getMonth() === insightMonth.getMonth();
  });
  const currentMonthExpenseTotal = currentMonthExpenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const previousMonthExpenses = expense.filter((item) => {
    const date = parseReportDate(item.date);
    const previousMonth = new Date(insightMonth.getFullYear(), insightMonth.getMonth() - 1, 1);
    return date &&
      date.getFullYear() === previousMonth.getFullYear() &&
      date.getMonth() === previousMonth.getMonth();
  });
  const previousMonthByCategory = previousMonthExpenses.reduce((totals, item) => {
    const category = String(item.category || "Other").trim() || "Other";
    totals[category] = (totals[category] || 0) + Number(item.amount || 0);
    return totals;
  }, {});
  const currentMonthByCategory = currentMonthExpenses.reduce((totals, item) => {
    const category = String(item.category || "Other").trim() || "Other";
    totals[category] = (totals[category] || 0) + Number(item.amount || 0);
    return totals;
  }, {});
  const spendingChanges = Object.entries(currentMonthByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      previous: previousMonthByCategory[category] || 0,
      change: previousMonthByCategory[category]
        ? Math.round(((amount - previousMonthByCategory[category]) / previousMonthByCategory[category]) * 100)
        : null,
    }))
    .filter((item) => item.change !== null &&
      item.change >= 15 &&
      item.amount - item.previous >= 100)
    .sort((a, b) => b.change - a.change);
  const budgetWarnings = storedBudgets
    .map((budget) => {
      const spent = currentMonthByCategory[budget.category] || 0;
      const limit = Number(budget.amount || 0);
      return {
        category: budget.category,
        percent: limit > 0 ? Math.round((spent / limit) * 100) : 0,
      };
    })
    .filter((budget) => budget.percent >= 80)
    .sort((a, b) => b.percent - a.percent);
  const plannedGoalSavings = storedGoals.reduce((sum, goal) => {
    const targetDate = goal.targetDate ? new Date(`${goal.targetDate}T00:00:00`) : null;
    const remaining = Math.max(0, Number(goal.target || 0) - Number(goal.saved || 0));
    if (!targetDate || Number.isNaN(targetDate.getTime()) || targetDate <= today || remaining === 0) {
      return sum;
    }
    const months = Math.max(1,
      (targetDate.getFullYear() - today.getFullYear()) * 12 +
      targetDate.getMonth() - today.getMonth()
    );
    return sum + remaining / months;
  }, 0);
  const overdueBills = storedBills.filter((bill) => {
    if (bill.status === "completed" || !bill.dueDate) return false;
    const due = parseReportDate(bill.dueDate);
    return due && due < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }).length;

  const categoryTotals = (() => {
    const totals = periodExpenses.reduce((result, item) => {
      const category = String(item.category || "Other").trim() || "Other";
      result[category] = (result[category] || 0) + Number(item.amount || 0);
      return result;
    }, {});
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  })();

  const transactions = [
    ...periodIncome.map((item) => ({ ...item, type: "Income" })),
    ...periodExpenses.map((item) => ({ ...item, type: "Expense" })),
  ].sort((a, b) => transactionTimestamp(b) - transactionTimestamp(a));
  const allTransactions = [
    ...income.map((item) => ({ ...item, type: "Income" })),
    ...expense.map((item) => ({ ...item, type: "Expense" })),
  ].sort((a, b) => transactionTimestamp(b) - transactionTimestamp(a));

  const visibleTransactions = transactions.filter((item) => {
    const query = search.trim().toLowerCase();
    return !query || [item.title, item.category, item.type]
      .some((value) => String(value || "").toLowerCase().includes(query));
  });

  const periodMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString("en-IN", { month: "short" }),
      income: 0,
      expense: 0,
    };
  });
  const monthIndexes = new Map(periodMonths.map((month, index) => [month.key, index]));
  [...income.map((item) => ({ ...item, type: "income" })),
    ...expense.map((item) => ({ ...item, type: "expense" }))].forEach((item) => {
    const date = parseReportDate(item.date);
    if (!date) return;
    const index = monthIndexes.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (index !== undefined) periodMonths[index][item.type] += Number(item.amount || 0);
  });

  const trendChartData = {
    labels: periodMonths.map((month) => month.label),
    datasets: [
      {
        label: "Income",
        data: periodMonths.map((month) => month.income),
        backgroundColor: "rgba(55, 166, 120, 0.12)",
        borderColor: "#37a678",
        borderWidth: 2,
        fill: true,
        tension: 0.38,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
      {
        label: "Expenses",
        data: periodMonths.map((month) => month.expense),
        backgroundColor: "rgba(237, 91, 115, 0.1)",
        borderColor: "#ed5b73",
        borderWidth: 2,
        fill: true,
        tension: 0.38,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
    ],
  };
  const trendChartOptions = {
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
          padding: 16,
          color: "#747b91",
          font: { size: 10, weight: "600" },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatMoney(context.raw)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: "rgba(123, 132, 157, 0.13)", drawTicks: false },
        ticks: {
          color: "#8990a2",
          padding: 8,
          callback: (value) => {
            const amount = Number(value);
            return amount >= 1000 ? `₹${(amount / 1000).toFixed(0)}k` : `₹${amount}`;
          },
        },
      },
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: { color: "#747b91", font: { size: 10, weight: "600" } },
      },
    },
  };

  const doughnutData = {
    labels: categoryTotals.map(([category]) => category),
    datasets: [{
      data: categoryTotals.map(([, amount]) => amount),
      backgroundColor: categoryTotals.map((_, index) => CATEGORY_COLORS[index % CATEGORY_COLORS.length]),
      borderWidth: 0,
      hoverOffset: 5,
    }],
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${formatMoney(context.raw)}`,
        },
      },
    },
  };

  const exportReport = () => downloadTransactions(
    visibleTransactions,
    `finance-report-${period === "month" ? statementMonth : period}.csv`,
    storedBills
  );
  const exportAllEntries = () => downloadTransactions(
    allTransactions,
    "all-finance-entries.csv",
    storedBills
  );
  const printStatement = () => window.print();

  const periodOptions = [
    ["week", "Last 7 days"],
    ["month", "Monthly statement"],
    ["year", "This year"],
    ["all", "All time"],
  ];
  const selectedPeriodMonthLabel = periodStart.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const isCurrentStatementMonth = periodStart.getFullYear() === today.getFullYear() &&
    periodStart.getMonth() === today.getMonth();
  const periodLabel = period === "month"
    ? (isCurrentStatementMonth ? "This month" : selectedPeriodMonthLabel)
    : (periodOptions.find(([value]) => value === period)?.[1] || "This month");

  return (
    <Layout>
      <main className="reports-management">
        <header className="reports-page-heading">
          <div>
            <span className="reports-page-kicker">YOUR MONEY, IN PERSPECTIVE</span>
            <h1>Reports <span>&amp; Insights</span></h1>
            <p>Understand your spending habits and see your financial progress.</p>
          </div>
          <label className="reports-period-select">
            <span>Report period</span>
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              {periodOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          {period === "month" && (
            <label className="reports-period-select reports-month-select">
              <span>Choose month</span>
              <input
                type="month"
                value={statementMonth}
                onChange={(event) => setStatementMonth(event.target.value)}
              />
            </label>
          )}
        </header>

        <section className="reports-summary-grid" aria-label={`${periodLabel} summary`}>
          <article className="reports-summary-card income">
            <span className="reports-summary-icon"><FaArrowDown /></span>
            <div>
              <span>Income</span>
              <strong>{formatMoney(totalIncome)}</strong>
              <small>{periodIncome.length} {periodIncome.length === 1 ? "income entry" : "income entries"}</small>
            </div>
          </article>
          <article className="reports-summary-card expense">
            <span className="reports-summary-icon"><FaArrowUp /></span>
            <div>
              <span>Expenses</span>
              <strong>{formatMoney(totalExpense)}</strong>
              <small>{periodExpenses.length} {periodExpenses.length === 1 ? "expense entry" : "expense entries"}</small>
            </div>
          </article>
          <article className={`reports-summary-card net ${netSavings < 0 ? "negative" : ""}`}>
            <span className="reports-summary-icon"><FaChartLine /></span>
            <div>
              <span>Net savings</span>
              <strong>{formatMoney(Math.abs(netSavings))}</strong>
              <small>{netSavings < 0 ? "Expenses exceed income" : `${savingsRate}% savings rate`}</small>
            </div>
          </article>
        </section>

        <section className="reports-analytics-grid" aria-label="Financial analytics">
          <article className="reports-panel reports-trend-panel">
            <header className="reports-panel-heading">
              <div>
                <span className="reports-section-kicker">CASH FLOW</span>
                <h2>Income &amp; expense trends</h2>
                <p>Monthly movement over the last six months.</p>
              </div>
              <span className="reports-panel-period">6 MONTHS</span>
            </header>
            <div className="reports-trend-chart">
              <Bar data={trendChartData} options={trendChartOptions} />
            </div>
          </article>

          <article className="reports-panel reports-category-panel">
            <header className="reports-panel-heading">
              <div>
                <span className="reports-section-kicker">SPENDING MIX</span>
                <h2>Expenses by category</h2>
                <p>{periodLabel} breakdown.</p>
              </div>
              <span className="reports-category-total">{formatMoney(totalExpense)}</span>
            </header>
            {categoryTotals.length === 0 ? (
              <div className="reports-chart-empty">
                Add expenses in this period to see your spending mix.
              </div>
            ) : (
              <div className="reports-category-content">
                <div className="reports-doughnut-wrap">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                  <div className="reports-doughnut-center">
                    <span>Total</span>
                    <strong>{formatMoney(totalExpense)}</strong>
                  </div>
                </div>
                <ul className="reports-category-legend">
                  {categoryTotals.map(([category, amount], index) => (
                    <li key={category}>
                      <span
                        className="reports-legend-dot"
                        style={{ background: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                      />
                      <span className="reports-legend-name">{category}</span>
                      <strong>
                        {totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0}%
                      </strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        </section>

        <section className="reports-transactions-panel">
          <header className="reports-transactions-heading">
            <div>
              <span className="reports-section-kicker">ACTIVITY</span>
              <h2>Recent transactions</h2>
              <p>{periodLabel} · {visibleTransactions.length} records</p>
            </div>
            <div className="reports-transaction-actions">
              <label className="reports-search">
                <FaSearch aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search transactions"
                  aria-label="Search report transactions"
                />
              </label>
              <button
                type="button"
                className="reports-export-button"
                onClick={exportReport}
                disabled={visibleTransactions.length === 0}
              >
                <FaDownload aria-hidden="true" />
                Export report
              </button>
              <button
                type="button"
                className="reports-export-all-button"
                onClick={exportAllEntries}
                disabled={allTransactions.length === 0}
                title="Download all income and expense entries, regardless of the selected report period or search."
              >
                <FaDownload aria-hidden="true" />
                Export all entries
              </button>
              <button
                type="button"
                className="reports-print-button"
                onClick={printStatement}
                disabled={transactions.length === 0}
              >
                <FaPrint aria-hidden="true" />
                Print statement
              </button>
            </div>
          </header>

          <div className="reports-table-wrap">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th className="reports-amount-heading">Amount</th>
                </tr>
              </thead>
              <tbody>
                {visibleTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="reports-empty-row">
                      {transactions.length === 0
                        ? `No transactions recorded for ${periodLabel.toLowerCase()}.`
                        : "No transactions match your search."}
                    </td>
                  </tr>
                ) : (
                  visibleTransactions.slice(0, 8).map((item) => (
                    <tr key={`${item.type}-${item.id}`}>
                      <td>{item.date || "—"}</td>
                      <td className="reports-description-cell">{item.title || "Untitled transaction"}</td>
                      <td>{item.category || "Other"}</td>
                      <td>
                        <span className={`reports-type-pill ${item.type.toLowerCase()}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className={`reports-amount-cell ${item.type.toLowerCase()}`}>
                        {item.type === "Income" ? "+" : "−"}{formatMoney(item.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <footer className="reports-table-footer">
            <span>Showing {Math.min(visibleTransactions.length, 8)} of {visibleTransactions.length} matching transactions</span>
            <span>All amounts in Indian Rupees</span>
          </footer>
        </section>
        <section className="reports-insights-panel" aria-label="Personalized financial insights">
          <header>
            <span className="reports-section-kicker">BASED ON YOUR RECORDS</span>
            <h2>Personal insights</h2>
            <p>These observations use entries saved in this browser; they are guidance, not a guaranteed forecast.</p>
          </header>
          {income.length === 0 && expense.length === 0 ? (
            <div className="reports-insight-item">
              <strong>Start with a few real entries</strong>
              <span>Add income and expenses to see spending comparisons and goal-planning estimates.</span>
            </div>
          ) : (
            <div className="reports-insights-grid">
              {currentMonthIncome === 0 || currentMonthExpenseTotal === 0 ? (
                <article className="reports-insight-item neutral">
                  <strong>More data will improve these insights</strong>
                  <span>
                    {currentMonthIncome === 0
                      ? `Record income for ${insightMonthLabel} before treating the recorded net as a savings estimate.`
                      : `No expenses are recorded for ${insightMonthLabel} yet, so spending comparisons are limited.`}
                  </span>
                </article>
              ) : (
                <article className={`reports-insight-item ${currentMonthIncome < currentMonthExpenseTotal ? "warning" : ""}`}>
                  <strong>
                    {currentMonthIncome >= currentMonthExpenseTotal
                        ? `${formatMoney(currentMonthIncome - currentMonthExpenseTotal)} recorded net for ${insightMonthLabel}`
                        : `Recorded spending is ${formatMoney(currentMonthExpenseTotal - currentMonthIncome)} above income for ${insightMonthLabel}`}
                  </strong>
                    <span>Calculated from entries dated {insightMonthLabel}; it is not a full-month forecast or a confirmed available balance.</span>
                </article>
              )}
              {budgetWarnings.length > 0 && (
                <article className="reports-insight-item warning">
                  <strong>{budgetWarnings[0].category} budget is at {budgetWarnings[0].percent}%</strong>
                  <span>Review this category’s spending against its monthly limit on the Budget page.</span>
                </article>
              )}
              {spendingChanges.length > 0 && (
                <article className="reports-insight-item">
                  <strong>{spendingChanges[0].category} spending rose {spendingChanges[0].change}%</strong>
                  <span>
                    {formatMoney(spendingChanges[0].amount)} recorded this month versus {formatMoney(spendingChanges[0].previous)} last month.
                    {previousMonthExpenses.length === 0 ? " There is no previous-month comparison data." : ""}
                  </span>
                </article>
              )}
              {plannedGoalSavings > 0 && (
                <article className="reports-insight-item">
                  <strong>Goal timelines call for about {formatMoney(plannedGoalSavings)} per month</strong>
                  <span>Estimate from today's date, remaining amounts, and your target dates. Compare it with actual cash flow before committing.</span>
                </article>
              )}
              {overdueBills > 0 && (
                <article className="reports-insight-item warning">
                  <strong>{overdueBills} payment{overdueBills === 1 ? " is" : "s are"} past due</strong>
                  <span>These payments are overdue now. Check Bills &amp; EMI and update a due date if your schedule changed.</span>
                </article>
              )}
              {budgetWarnings.length === 0 && spendingChanges.length === 0 &&
                plannedGoalSavings === 0 && overdueBills === 0 && currentMonthIncome > 0 &&
                currentMonthExpenseTotal > 0 && (
                  <article className="reports-insight-item neutral">
                    <strong>No unusual trend detected from the available records</strong>
                    <span>As more months and goals are recorded, comparisons can become more useful.</span>
                  </article>
                )}
            </div>
          )}
        </section>
        <section className="reports-print-sheet" aria-label="Printable financial statement">
          <h1>Personal Finance Statement</h1>
          <p>{periodLabel} · Generated {today.toLocaleDateString("en-IN")}</p>
          <div className="reports-print-summary">
            <span>Income <strong>{formatMoney(totalIncome)}</strong></span>
            <span>Expenses <strong>{formatMoney(totalExpense)}</strong></span>
            <span>Net savings <strong>{formatMoney(netSavings)}</strong></span>
          </div>
          <h2>Spending by category</h2>
          <table>
            <thead><tr><th>Category</th><th>Amount</th></tr></thead>
            <tbody>
              {categoryTotals.length === 0
                ? <tr><td colSpan="2">No expense categories recorded for this period.</td></tr>
                : categoryTotals.map(([category, amount]) => (
                  <tr key={category}><td>{category}</td><td>{formatMoney(amount)}</td></tr>
                ))}
            </tbody>
          </table>
          <h2>Transactions</h2>
          <table>
            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th></tr></thead>
            <tbody>
              {transactions.length === 0
                ? <tr><td colSpan="5">No transactions recorded for this period.</td></tr>
                : transactions.map((item) => (
                  <tr key={`print-${item.type}-${item.id}`}>
                    <td>{item.date || "—"}</td>
                    <td>{item.title || "Untitled transaction"}</td>
                    <td>{item.category || "Other"}</td>
                    <td>{item.type}</td>
                    <td>{item.type === "Income" ? "+" : "−"}{formatMoney(item.amount)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      </main>
    </Layout>
  );
}

export default Reports;
