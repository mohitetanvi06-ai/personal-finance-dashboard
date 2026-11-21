import { useContext, useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaCoins,
  FaSearch,
  FaTrash,
} from "react-icons/fa";

import Layout from "../components/Layout";
import { FinanceContext } from "../context/FinanceDataContext";

import "./Budget.css";

const BUDGET_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "EMI",
  "Education",
  "Entertainment",
  "Health",
  "Travel",
  "Other",
];

function parseBudgetDate(value) {
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
    const month = first > 12 ? second : first;
    const day = first > 12 ? first : second;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1
      ? date
      : null;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Budget() {
  const {
    expense = [],
    budgets = [],
    setBudgets,
    preferences = {},
  } = useContext(FinanceContext);
  const [category, setCategory] = useState(BUDGET_CATEGORIES[0]);
  const [amount, setAmount] = useState(() => {
    const saved = budgets.find(
      (item) => String(item.category).toLowerCase() === BUDGET_CATEGORIES[0].toLowerCase()
    );
    return saved ? String(saved.amount) : "";
  });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("usage");

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentMonthExpenses = expense.filter((item) => {
    const date = parseBudgetDate(item.date);
    return date &&
      date.getFullYear() === currentYear &&
      date.getMonth() === currentMonth;
  });

  const spendByCategory = currentMonthExpenses.reduce((totals, item) => {
    const key = String(item.category || "Other").trim().toLowerCase();
    totals[key] = (totals[key] || 0) + Number(item.amount || 0);
    return totals;
  }, {});
  const totalBudget = budgets.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const totalSpent = currentMonthExpenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const remaining = totalBudget - totalSpent;
  const usage = totalBudget > 0
    ? Math.round((totalSpent / totalBudget) * 100)
    : 0;
  const exceededBudgets = budgets.filter((item) => (
    (spendByCategory[String(item.category || "").trim().toLowerCase()] || 0) >
    Number(item.amount || 0)
  )).length;
  const budgetAlertsEnabled = preferences.smartAlerts === true;
  const budgetWarnings = budgets
    .map((item) => {
      const spent = spendByCategory[String(item.category || "").trim().toLowerCase()] || 0;
      const limit = Number(item.amount || 0);
      const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      return { category: item.category, spent, limit, percent, exceeded: spent > limit };
    })
    .filter((item) => item.exceeded || (budgetAlertsEnabled && item.percent >= 80))
    .sort((a, b) => b.percent - a.percent);

  const query = search.trim().toLowerCase();
  const filteredBudgets = budgets
    .filter((item) => String(item.category || "").toLowerCase().includes(query))
    .sort((a, b) => {
      const spentA = spendByCategory[String(a.category || "").trim().toLowerCase()] || 0;
      const spentB = spendByCategory[String(b.category || "").trim().toLowerCase()] || 0;
      const usageA = Number(a.amount) > 0 ? spentA / Number(a.amount) : 0;
      const usageB = Number(b.amount) > 0 ? spentB / Number(b.amount) : 0;
      if (sortBy === "alphabetical") {
        return String(a.category).localeCompare(String(b.category));
      }
      if (sortBy === "amount") {
        return Number(b.amount || 0) - Number(a.amount || 0);
      }
      return usageB - usageA;
    });
  const filteredTotalSpent = filteredBudgets.reduce(
    (sum, item) => sum +
      (spendByCategory[String(item.category || "").trim().toLowerCase()] || 0),
    0
  );

  const existingBudget = budgets.find(
    (item) => String(item.category).toLowerCase() === category.toLowerCase()
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      window.alert("Please enter a valid monthly budget amount.");
      return;
    }

    setBudgets((items) => {
      const existing = items.find(
        (item) => String(item.category).toLowerCase() === category.toLowerCase()
      );
      if (existing) {
        return items.map((item) => item.id === existing.id
          ? { ...item, category, amount: numericAmount }
          : item
        );
      }
      return [...items, { id: Date.now(), category, amount: numericAmount }];
    });
    setAmount(String(numericAmount));
  };

  const deleteBudget = (id) => {
    setBudgets((items) => items.filter((item) => item.id !== id));
  };

  const monthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <Layout>
      <main className="budget-management">
        <header className="budget-page-heading">
          <div>
            <span className="budget-page-kicker">PLAN WITH PURPOSE</span>
            <h1>Budget <span>Management</span></h1>
            <p>Track your {monthLabel} spending against the limits you set.</p>
          </div>
          <div className="budget-month-pill">
            <span className="budget-month-dot" />
            {monthLabel}
          </div>
        </header>

        <section className="budget-summary-grid" aria-label="Budget summary">
          <article className="budget-summary-card">
            <div className="budget-summary-icon target"><FaCoins /></div>
            <div className="budget-summary-copy">
              <span>Total budget</span>
              <strong>{formatMoney(totalBudget)}</strong>
              <small>{budgets.length} {budgets.length === 1 ? "category planned" : "categories planned"}</small>
            </div>
          </article>
          <article className="budget-summary-card">
            <div className="budget-summary-icon spent"><FaArrowUp /></div>
            <div className="budget-summary-copy">
              <span>Total spent this month</span>
              <strong>{formatMoney(totalSpent)}</strong>
              <small>{usage}% of your planned budget</small>
            </div>
            <span className={`budget-usage-badge ${usage >= 100 ? "over" : usage >= 80 ? "near" : ""}`}>
              {usage}%
            </span>
          </article>
          <article className="budget-summary-card">
            <div className="budget-summary-icon remaining"><FaArrowDown /></div>
            <div className="budget-summary-copy">
              <span>{remaining < 0 ? "Over budget" : "Remaining"}</span>
              <strong className={remaining < 0 ? "over-budget-text" : ""}>
                {formatMoney(Math.abs(remaining))}
              </strong>
              <small>{exceededBudgets
                ? `${exceededBudgets} ${exceededBudgets === 1 ? "category is" : "categories are"} over limit`
                : "Available across your categories"}
              </small>
            </div>
          </article>
        </section>

        {budgetWarnings.length > 0 && (
          <section
            className={`budget-alert-panel ${exceededBudgets > 0 ? "over" : ""}`}
            aria-live="polite"
            aria-label="Budget alerts"
          >
            <div className="budget-alert-symbol"><FaArrowUp aria-hidden="true" /></div>
            <div>
              <strong>
                {exceededBudgets > 0 ? "Budget limit exceeded" : "Spending heads-up"}
              </strong>
              <p>
                {budgetWarnings.slice(0, 3).map((item) => (
                  item.exceeded
                    ? `${item.category} is over by ${formatMoney(item.spent - item.limit)} (${formatMoney(item.spent)} spent of ${formatMoney(item.limit)})`
                    : `${item.category} is at ${item.percent}% (${formatMoney(item.spent)} of ${formatMoney(item.limit)})`
                )).join(" · ")}
              </p>
            </div>
          </section>
        )}

        <div className="budget-management-grid">
          <section className="budget-entry-card">
            <header className="budget-form-heading">
              <div className="budget-form-icon"><FaCoins /></div>
              <div>
                <h2>{existingBudget ? "Update budget" : "Set a budget"}</h2>
                <p>Choose a category and monthly spending limit.</p>
              </div>
            </header>

            <form className="budget-entry-form" onSubmit={handleSubmit}>
              <label className="budget-field">
                <span>Spending category</span>
                <select
                  value={category}
                  onChange={(event) => {
                    const nextCategory = event.target.value;
                    const savedBudget = budgets.find(
                      (item) => String(item.category).toLowerCase() === nextCategory.toLowerCase()
                    );
                    setCategory(nextCategory);
                    setAmount(savedBudget ? String(savedBudget.amount) : "");
                  }}
                >
                  {BUDGET_CATEGORIES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <small>
                  {existingBudget
                    ? `Current limit: ${formatMoney(existingBudget.amount)}`
                    : "Each category can have one monthly limit."}
                </small>
              </label>
              <label className="budget-field">
                <span>Monthly limit</span>
                <div className="budget-amount-input">
                  <span aria-hidden="true">₹</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder={existingBudget ? String(existingBudget.amount) : "0.00"}
                    required
                  />
                </div>
                <small>Set an amount you want to stay within.</small>
              </label>
              <button className="budget-submit-button" type="submit">
                <FaCoins aria-hidden="true" />
                {existingBudget ? "Update category budget" : "Add category budget"}
              </button>
            </form>

            <div className="budget-tip-card">
              <span className="budget-tip-sparkle">✦</span>
              <div>
                <strong>Small steps, steady control</strong>
                <p>Review category limits as your monthly plans change.</p>
              </div>
            </div>
          </section>

          <section className="budget-list-card">
            <header className="budget-list-heading">
              <div>
                <span className="budget-section-kicker">MONTHLY PLAN</span>
                <h2>Your budgets</h2>
                <p>Spending progress for {monthLabel}.</p>
              </div>
              <div className="budget-list-actions">
                <div className="budget-filtered-spend">
                  <span>Shown spent</span>
                  <strong>{formatMoney(filteredTotalSpent)}</strong>
                </div>
                <label className="budget-search">
                  <FaSearch aria-hidden="true" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Find category"
                    aria-label="Search budget categories"
                  />
                </label>
              </div>
            </header>

            <div className="budget-sort-row">
              <span>Sort by</span>
              <button
                type="button"
                className={sortBy === "usage" ? "active" : ""}
                onClick={() => setSortBy("usage")}
              >
                Most used
              </button>
              <button
                type="button"
                className={sortBy === "alphabetical" ? "active" : ""}
                onClick={() => setSortBy("alphabetical")}
              >
                A–Z
              </button>
              <button
                type="button"
                className={sortBy === "amount" ? "active" : ""}
                onClick={() => setSortBy("amount")}
              >
                Budget amount
              </button>
            </div>

            {filteredBudgets.length === 0 ? (
              <div className="budget-empty-state">
                <div className="budget-empty-icon"><FaCoins /></div>
                <strong>{budgets.length === 0 ? "Your plan starts here" : "No matching categories"}</strong>
                <p>{budgets.length === 0
                  ? "Set your first category limit to start tracking monthly spending."
                  : "Try another category name or clear your search."}
                </p>
              </div>
            ) : (
              <div className="budget-cards-grid">
                {filteredBudgets.map((item, index) => {
                  const spent = spendByCategory[String(item.category || "").trim().toLowerCase()] || 0;
                  const limit = Number(item.amount || 0);
                  const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
                  const remainingAmount = limit - spent;
                  const tone = percent >= 100 ? "over" : percent >= 80 ? "near" : "safe";
                  return (
                    <article className={`budget-category-card ${tone}`} key={item.id}>
                      <header className="budget-category-heading">
                        <span className={`budget-category-icon tone-${(index % 4) + 1}`}>
                          <FaCoins aria-hidden="true" />
                        </span>
                        <strong>{item.category}</strong>
                        <span className="budget-category-percent">{percent}%</span>
                        <button
                          type="button"
                          className="budget-delete-button"
                          onClick={() => deleteBudget(item.id)}
                          aria-label={`Delete ${item.category} budget`}
                          title="Delete category budget"
                        >
                          <FaTrash aria-hidden="true" />
                        </button>
                      </header>

                      <div
                        className="budget-progress-track"
                        role="progressbar"
                        aria-label={`${item.category} budget used`}
                        aria-valuenow={Math.min(percent, 100)}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        <span style={{ width: `${Math.min(percent, 100)}%` }} />
                      </div>

                      <div className="budget-spending-row">
                        <span>{formatMoney(spent)} spent</span>
                        <strong className={remainingAmount < 0 ? "over-budget-text" : ""}>
                          {remainingAmount < 0
                            ? `${formatMoney(Math.abs(remainingAmount))} over`
                            : `${formatMoney(remainingAmount)} left`}
                        </strong>
                      </div>

                      <div className="budget-limit-row">
                        <span>Monthly limit</span>
                        <strong>{formatMoney(limit)}</strong>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <footer className="budget-list-footer">
              <span>{filteredBudgets.length} of {budgets.length} categories</span>
              <span>Actuals based on recorded expenses this month</span>
            </footer>
          </section>
        </div>
      </main>
    </Layout>
  );
}

export default Budget;
