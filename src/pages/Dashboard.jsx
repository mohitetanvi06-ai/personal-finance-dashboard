import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaArrowDown,
  FaArrowUp,
  FaPiggyBank,
  FaWallet,
  FaCalendarCheck,
  FaDownload,
  FaExclamationTriangle,
  FaPrint,
} from "react-icons/fa";

import Layout from "../components/Layout";
import DashboardCard from "../components/DashboardCard";
import FinanceChart from "../components/FinanceChart";
import ExpenseBreakdown from "../components/ExpenseBreakdown";
import QuickCalculator from "../components/QuickCalculator";
import SearchBar from "../components/SearchBar";
import { FinanceContext } from "../context/FinanceDataContext";
import {
  formatCalendarNoteDate,
} from "../utils/calendarNotes";
import { downloadTransactions } from "../utils/financeExports";

import "./Dashboard.css";

const formatMoney = (amount) =>
  `₹ ${Math.abs(Number(amount || 0)).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

function parseDashboardDate(value) {
  if (!value) return null;
  const text = String(value).trim();
  const isoDate = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  if (isoDate) {
    const date = new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
    return date.getFullYear() === Number(isoDate[1]) &&
      date.getMonth() === Number(isoDate[2]) - 1 &&
      date.getDate() === Number(isoDate[3])
      ? date
      : null;
  }

  const localDate = /^(\d{1,2})[/. -](\d{1,2})[/. -](\d{2,4})$/.exec(text);
  if (localDate) {
    const first = Number(localDate[1]);
    const second = Number(localDate[2]);
    const yearValue = Number(localDate[3]);
    const year = yearValue < 100 ? 2000 + yearValue : yearValue;
    const month = first > 12 ? second : first;
    const day = first > 12 ? first : second;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 &&
      date.getDate() === day
      ? date
      : null;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function Dashboard() {
  const location = useLocation();
  const {
    income = [],
    expense = [],
    bills: billPayments = [],
    budgets: categoryBudgets = [],
    calendarNotes = {},
  } = useContext(FinanceContext);
  const [search, setSearch] = useState("");
  const [statementDate] = useState(() => new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }));
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const upcomingPayments = billPayments.filter((bill) => {
    if (bill.status === "completed" || !bill.dueDate) return false;
    const dueDate = new Date(`${bill.dueDate}T00:00:00`);
    const daysUntilDue = Math.ceil((dueDate - todayStart) / 86_400_000);
    return !Number.isNaN(dueDate.getTime()) && daysUntilDue <= 7;
  });
  const upcomingPaymentTotal = upcomingPayments.reduce(
    (sum, bill) => sum + Number(bill.amount || 0),
    0
  );
  const overduePaymentCount = upcomingPayments.filter((bill) => (
    new Date(`${bill.dueDate}T00:00:00`) < todayStart
  )).length;
  const savedCalendarNotes = Object.entries(calendarNotes)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB));

  const totalIncome = income.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const totalExpense = expense.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0
    ? Math.max(0, Math.min(100, Math.round((balance / totalIncome) * 100)))
    : 0;

  const transactions = useMemo(() => {
    const allTransactions = [
      ...income.map((item) => ({ ...item, type: "Income" })),
      ...expense.map((item) => ({ ...item, type: "Expense" })),
    ];

    return allTransactions.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA || Number(b.id || 0) - Number(a.id || 0);
    });
  }, [income, expense]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return transactions;

    return transactions.filter((item) =>
      [item.title, item.category, item.type]
        .some((value) => String(value || "").toLowerCase().includes(query))
    );
  }, [search, transactions]);
  const currentMonthExpenses = expense.filter((item) => {
    const date = parseDashboardDate(item.date);
    return date && date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth();
  });
  const currentMonthSpendByCategory = currentMonthExpenses.reduce((totals, item) => {
    const category = String(item.category || "Other").trim().toLowerCase();
    totals[category] = (totals[category] || 0) + Number(item.amount || 0);
    return totals;
  }, {});
  const exceededCategoryBudgets = categoryBudgets
    .map((budget) => {
      const category = String(budget.category || "").trim();
      const spent = currentMonthSpendByCategory[category.toLowerCase()] || 0;
      const limit = Number(budget.amount || 0);
      return { category, spent, limit, overBy: spent - limit };
    })
    .filter((budget) => budget.category && budget.limit > 0 && budget.overBy > 0)
    .sort((a, b) => b.overBy - a.overBy);
  const exportAllEntries = () => downloadTransactions(
    transactions,
    "all-finance-entries.csv",
    billPayments
  );
  const printStatement = () => window.print();

  useEffect(() => {
    if (location.hash === "#dashboard-calculator") {
      document.getElementById("dashboard-calculator")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  return (
    <Layout>
      <div className="dashboard-page">
        <header className="dashboard-heading">
          <div>
            <span className="dashboard-eyebrow">YOUR FINANCIAL SPACE</span>
            <h2>Financial Overview</h2>
            <p>A clear view of your money, all in one place.</p>
          </div>
          <div className="dashboard-heading-actions">
            <div className="dashboard-date">
              <span>Today</span>
              <strong>
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </strong>
            </div>
            <div className="dashboard-export-actions">
              <button
                type="button"
                className="dashboard-export-button"
                onClick={exportAllEntries}
                disabled={transactions.length === 0}
              >
                <FaDownload aria-hidden="true" />
                Download CSV
              </button>
              <button
                type="button"
                className="dashboard-statement-button"
                onClick={printStatement}
                disabled={transactions.length === 0}
              >
                <FaPrint aria-hidden="true" />
                Statement
              </button>
            </div>
          </div>
        </header>

        <section className="dashboard-summary-grid" aria-label="Financial summary">
          <DashboardCard
            title="Total Balance"
            amount={balance}
            bgColor="blue"
            icon={<FaWallet />}
            subtitle="Income minus expenses"
          />
          <DashboardCard
            title="Total Income"
            amount={totalIncome}
            bgColor="green"
            icon={<FaArrowDown />}
            subtitle={`${income.length} recorded entries`}
          />
          <DashboardCard
            title="Total Expenses"
            amount={totalExpense}
            bgColor="red"
            icon={<FaArrowUp />}
            subtitle={`${expense.length} recorded entries`}
          />
          <DashboardCard
            title="Net Savings"
            amount={balance}
            bgColor="yellow"
            icon={<FaPiggyBank />}
            subtitle={`${savingsRate}% of income retained`}
          />
        </section>

        {upcomingPayments.length > 0 && (
          <Link to="/bills" className={`dashboard-bill-reminder ${overduePaymentCount ? "overdue" : ""}`}>
            <span className="dashboard-bill-reminder-icon"><FaCalendarCheck aria-hidden="true" /></span>
            <span className="dashboard-bill-reminder-copy">
              <strong>
                {overduePaymentCount
                  ? `${overduePaymentCount} overdue payment${overduePaymentCount === 1 ? "" : "s"}`
                  : `${upcomingPayments.length} payment${upcomingPayments.length === 1 ? "" : "s"} due within 7 days`}
              </strong>
              <small>Review your EMI and bill calendar</small>
            </span>
            <span className="dashboard-bill-reminder-amount">{formatMoney(upcomingPaymentTotal)}</span>
            <span className="dashboard-bill-reminder-arrow" aria-hidden="true">→</span>
          </Link>
        )}

        {exceededCategoryBudgets.length > 0 && (
          <Link to="/budget" className="dashboard-budget-alert" role="status">
            <span className="dashboard-budget-alert-icon">
              <FaExclamationTriangle aria-hidden="true" />
            </span>
            <span className="dashboard-budget-alert-copy">
              <strong>
                {exceededCategoryBudgets.length === 1
                  ? `${exceededCategoryBudgets[0].category} budget exceeded`
                  : `${exceededCategoryBudgets.length} category budgets exceeded`}
              </strong>
              <small>
                {exceededCategoryBudgets.slice(0, 3).map((budget) => (
                  `${budget.category}: ${formatMoney(budget.overBy)} over budget`
                )).join(" · ")}
              </small>
            </span>
            <span className="dashboard-budget-alert-action">Review budget <span aria-hidden="true">→</span></span>
          </Link>
        )}

        {savedCalendarNotes.length > 0 && (
          <section className="dashboard-calendar-notes" aria-labelledby="dashboard-calendar-notes-title">
            <header className="dashboard-calendar-notes-heading">
              <span className="dashboard-calendar-notes-icon">
                <FaCalendarCheck aria-hidden="true" />
              </span>
              <div>
                <h3 id="dashboard-calendar-notes-title">Calendar notes</h3>
                <p>Your saved reminders, with their dates and days.</p>
              </div>
              <Link to="/savings-goals">Manage notes <span aria-hidden="true">→</span></Link>
            </header>
            <ul className="dashboard-calendar-notes-list">
              {savedCalendarNotes.map(([date, note]) => (
                <li key={date}>
                  <time dateTime={date}>
                    {formatCalendarNoteDate(date, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  <p>{note}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="dashboard-insights-grid" aria-label="Spending analytics">
          <FinanceChart income={income} expense={expense} />
          <ExpenseBreakdown expense={expense} />
          <QuickCalculator />
        </section>

        <section className="dashboard-bottom-grid">
          <div className="dashboard-transactions">
            <div className="dashboard-section-heading">
              <div>
                <h4>Recent Transactions</h4>
                <p>Your latest income and spending activity.</p>
              </div>
              <span className="transaction-count">
                {filteredTransactions.length} records
              </span>
            </div>

            <SearchBar search={search} setSearch={setSearch} />

            <div className="table-responsive">
              <table className="table dashboard-table align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="dashboard-empty-state">
                        {transactions.length === 0
                          ? "Your transactions will appear here once you add them."
                          : "No transactions match your search."}
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.slice(0, 5).map((item) => (
                      <tr key={`${item.type}-${item.id}`}>
                        <td>{item.date || "—"}</td>
                        <td>{item.category || "Other"}</td>
                        <td>{item.title || "Untitled transaction"}</td>
                        <td>
                          <span className={`dashboard-type-badge ${item.type.toLowerCase()}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className={`text-end dashboard-amount ${item.type.toLowerCase()}`}>
                          {item.type === "Income" ? "+" : "−"}{formatMoney(item.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="dashboard-savings-card">
            <div className="dashboard-savings-heading">
              <div className="dashboard-savings-icon"><FaPiggyBank /></div>
              <span className="dashboard-savings-kicker">SAVINGS SNAPSHOT</span>
            </div>
            <h4>Keep your goals in sight</h4>
            <p>Your current net balance is a great starting point for your next goal.</p>
            <div className="dashboard-savings-total">
              {balance < 0 ? "−" : ""}{formatMoney(balance)}
            </div>
            <div
              className="dashboard-savings-track"
              role="progressbar"
              aria-label="Savings rate"
              aria-valuenow={savingsRate}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <span style={{ width: `${savingsRate}%` }} />
            </div>
            <div className="dashboard-savings-meta">
              <span>Savings rate</span>
              <strong>{savingsRate}%</strong>
            </div>
            <Link to="/savings-goals" className="dashboard-goals-link">
              Explore savings goals <span aria-hidden="true">→</span>
            </Link>
          </aside>
        </section>
        <section className="dashboard-print-sheet" aria-label="Printable account statement">
          <h1>Personal Finance Statement</h1>
          <p>All recorded entries · Generated {statementDate}</p>
          <div className="dashboard-print-summary">
            <span>Total income<strong>{formatMoney(totalIncome)}</strong></span>
            <span>Total expenses<strong>{formatMoney(totalExpense)}</strong></span>
            <span>Net balance<strong>{balance < 0 ? "−" : ""}{formatMoney(balance)}</strong></span>
          </div>
          <h2>All transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Bill / EMI details</th>
                <th>Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan="6">No transactions recorded.</td></tr>
              ) : transactions.map((item) => {
                const bill = billPayments.find((savedBill) => (
                  savedBill.id === item.billId ||
                  (Array.isArray(savedBill.payments) &&
                    savedBill.payments.some((payment) => String(payment.id) === String(item.id)))
                ));
                const payment = bill?.payments?.find(
                  (savedPayment) => String(savedPayment.id) === String(item.id)
                );
                const installment = item.installmentNumber ?? payment?.installmentNumber;
                const totalInstallments = item.totalInstallments ??
                  payment?.totalInstallments ?? bill?.totalInstallments;
                const paymentDetails = bill
                  ? `${bill.type} · ${item.frequency || payment?.frequency || bill.frequency} · ${
                    installment ? `Installment ${installment}${totalInstallments ? ` of ${totalInstallments}` : ""}` : "Payment"
                  }`
                  : "—";
                return (
                  <tr key={`${item.type}-${item.id}`}>
                    <td>{item.date || "—"}</td>
                    <td>{item.title || "Untitled transaction"}</td>
                    <td>{item.category || "Other"}</td>
                    <td>{item.type}</td>
                    <td>{paymentDetails}</td>
                    <td>{item.type === "Income" ? "+" : "−"}{formatMoney(item.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </Layout>
  );
}

export default Dashboard;
