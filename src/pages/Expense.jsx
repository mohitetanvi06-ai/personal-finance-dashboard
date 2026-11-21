import { useContext, useMemo, useState } from "react";
import { FaArrowUp, FaDownload, FaSearch, FaTrash } from "react-icons/fa";

import ExpenseForm from "../components/ExpenseForm";
import Layout from "../components/Layout";
import { FinanceContext } from "../context/FinanceDataContext";

import "./Expense.css";

function parseExpenseDate(value) {
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

function formatDate(value) {
  const date = parseExpenseDate(value);
  return date
    ? date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : value || "—";
}

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Expense() {
  const { expense = [], setExpense } = useContext(FinanceContext);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const totalExpense = expense.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const currentMonthExpense = expense.reduce((sum, item) => {
    const date = parseExpenseDate(item.date);
    const now = new Date();
    return date && date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
      ? sum + Number(item.amount || 0)
      : sum;
  }, 0);

  const categoryTotals = useMemo(() => {
    const totals = expense.reduce((categories, item) => {
      const category = String(item.category || "Other").trim() || "Other";
      categories[category] = (categories[category] || 0) + Number(item.amount || 0);
      return categories;
    }, {});
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [expense]);

  const years = useMemo(() => (
    [...new Set(expense
      .map((item) => parseExpenseDate(item.date)?.getFullYear())
      .filter(Boolean))]
      .sort((a, b) => b - a)
  ), [expense]);

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = expense.filter((item) => {
      const date = parseExpenseDate(item.date);
      const matchesSearch = !query ||
        [item.title, item.category, item.amount]
          .some((value) => String(value || "").toLowerCase().includes(query));
      const matchesYear = selectedYear === "all" ||
        (date && date.getFullYear() === Number(selectedYear));
      const matchesMonth = selectedMonth === "all" ||
        (date && date.getMonth() === Number(selectedMonth));
      return matchesSearch && matchesYear && matchesMonth;
    });

    return rows.sort((a, b) => {
      if (sortBy === "oldest") {
        return (parseExpenseDate(a.date)?.getTime() || 0) -
          (parseExpenseDate(b.date)?.getTime() || 0);
      }
      if (sortBy === "amount-high") {
        return Number(b.amount || 0) - Number(a.amount || 0);
      }
      if (sortBy === "amount-low") {
        return Number(a.amount || 0) - Number(b.amount || 0);
      }
      return (parseExpenseDate(b.date)?.getTime() || 0) -
        (parseExpenseDate(a.date)?.getTime() || 0);
    });
  }, [expense, search, selectedYear, selectedMonth, sortBy]);

  const filteredCategoryTotals = useMemo(() => {
    return filteredExpenses.reduce((categories, item) => {
      const category = String(item.category || "Other").trim() || "Other";
      categories[category] = (categories[category] || 0) + Number(item.amount || 0);
      return categories;
    }, {});
  }, [filteredExpenses]);

  const deleteExpense = (id) => {
    setExpense((items) => items.filter((item) => item.id !== id));
  };

  const exportExpenses = () => {
    const escapeCsv = (value) => {
      const text = String(value ?? "");
      const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText.replace(/"/g, '""')}"`;
    };
    const rows = [
      ["Date", "Description", "Category", "Amount (INR)"],
      ...filteredExpenses.map((item) => [
        formatDate(item.date),
        item.title,
        item.category || "Other",
        Number(item.amount || 0).toFixed(2),
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "expense-entries.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <Layout>
      <main className="expense-management">
        <header className="expense-page-heading">
          <div>
            <span className="expense-page-kicker">SPENDING, IN FOCUS</span>
            <h1>Expense <span>Management</span></h1>
            <p>Know where your money goes and keep every expense organized.</p>
          </div>
          <div className="expense-page-total">
            <div className="expense-total-icon"><FaArrowUp /></div>
            <div>
              <span>ALL-TIME SPENDING</span>
              <strong>{formatMoney(totalExpense)}</strong>
            </div>
          </div>
        </header>

        <section className="expense-overview" aria-label="Expense summary">
          <div className="expense-overview-card expense-overview-total">
            <span>Total spending</span>
            <strong>{formatMoney(totalExpense)}</strong>
            <small>{expense.length} recorded {expense.length === 1 ? "expense" : "expenses"}</small>
          </div>
          <div className="expense-overview-card expense-overview-month">
            <span>This month</span>
            <strong>{formatMoney(currentMonthExpense)}</strong>
            <small>Spending so far this month</small>
          </div>
          <div className="expense-overview-card expense-overview-category">
            <span>Top category</span>
            <strong>{categoryTotals[0]?.[0] || "No expenses yet"}</strong>
            <small>{categoryTotals[0] ? formatMoney(categoryTotals[0][1]) : "Add an expense to get started"}</small>
          </div>
        </section>

        <div className="expense-management-grid">
          <ExpenseForm />

          <section className="expense-entries-card">
            <header className="expense-entries-heading">
              <div>
                <span className="expense-section-kicker">YOUR RECORDS</span>
                <h2>Expense Entries</h2>
                <p>{filteredExpenses.length} {filteredExpenses.length === 1 ? "entry" : "entries"}</p>
              </div>
              <div className="expense-entry-summary">
                <span>Filtered total</span>
                <strong>{formatMoney(filteredExpenses.reduce(
                  (sum, item) => sum + Number(item.amount || 0),
                  0
                ))}</strong>
              </div>
            </header>

            {categoryTotals.length > 0 && (
              <div className="expense-category-breakdown" aria-label="Spending by category">
                {Object.entries(filteredCategoryTotals)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([category, amount], index) => {
                    const filteredTotal = filteredExpenses.reduce(
                      (sum, item) => sum + Number(item.amount || 0),
                      0
                    );
                    const share = filteredTotal > 0
                      ? Math.round((amount / filteredTotal) * 100)
                      : 0;
                    return (
                      <div className="expense-category-item" key={category}>
                        <div className="expense-category-label">
                          <span className={`expense-category-dot tone-${index + 1}`} />
                          <span>{category}</span>
                          <strong>{formatMoney(amount)}</strong>
                        </div>
                        <div className="expense-category-track">
                          <span
                            className={`tone-${index + 1}`}
                            style={{ width: `${share}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="expense-toolbar">
              <label className="expense-search">
                <FaSearch aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search expenses"
                  aria-label="Search expense entries"
                />
              </label>
              <label className="expense-filter">
                <span className="visually-hidden">Sort expense entries</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="amount-high">Amount: high to low</option>
                  <option value="amount-low">Amount: low to high</option>
                </select>
              </label>
              <label className="expense-filter">
                <span className="visually-hidden">Filter by year</span>
                <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
                  <option value="all">All years</option>
                  {years.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </label>
              <label className="expense-filter">
                <span className="visually-hidden">Filter by month</span>
                <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
                  <option value="all">All months</option>
                  {Array.from({ length: 12 }, (_, month) => (
                    <option key={month} value={month}>
                      {new Date(2000, month, 1).toLocaleDateString("en-IN", { month: "long" })}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="expense-export-button"
                onClick={exportExpenses}
                disabled={filteredExpenses.length === 0}
              >
                <FaDownload aria-hidden="true" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="expense-table-wrap">
              <table className="expense-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th className="expense-actions-heading">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td className="expense-empty-state" colSpan="5">
                        {expense.length === 0
                          ? "Your expenses will appear here after you add your first one."
                          : "No expenses match these filters."}
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDate(item.date)}</td>
                        <td className="expense-source-cell">{item.title || "Untitled expense"}</td>
                        <td><span className="expense-category-tag">{item.category || "Other"}</span></td>
                        <td className="expense-amount-cell">−{formatMoney(item.amount)}</td>
                        <td className="expense-actions-cell">
                          <button
                            type="button"
                            className="expense-delete-button"
                            onClick={() => deleteExpense(item.id)}
                            aria-label={`Delete ${item.title || "expense entry"}`}
                            title="Delete expense entry"
                          >
                            <FaTrash aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <footer className="expense-table-footer">
              <span>Showing {filteredExpenses.length} of {expense.length} expense entries</span>
              <span>Amounts shown in Indian Rupees</span>
            </footer>
          </section>
        </div>
      </main>
    </Layout>
  );
}

export default Expense;
