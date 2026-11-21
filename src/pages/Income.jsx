import { useContext, useMemo, useState } from "react";
import { FaArrowDown, FaDownload, FaSearch, FaTrash } from "react-icons/fa";

import IncomeForm from "../components/IncomeForm";
import Layout from "../components/Layout";
import { FinanceContext } from "../context/FinanceDataContext";

import "./Income.css";

function parseIncomeDate(value) {
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
  const date = parseIncomeDate(value);
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

function Income() {
  const { income = [], setIncome } = useContext(FinanceContext);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const totalIncome = income.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const currentMonthIncome = income.reduce((sum, item) => {
    const date = parseIncomeDate(item.date);
    const now = new Date();
    return date && date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
      ? sum + Number(item.amount || 0)
      : sum;
  }, 0);

  const years = useMemo(() => (
    [...new Set(income
      .map((item) => parseIncomeDate(item.date)?.getFullYear())
      .filter(Boolean))]
      .sort((a, b) => b - a)
  ), [income]);

  const filteredIncome = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = income.filter((item) => {
      const date = parseIncomeDate(item.date);
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
        return (parseIncomeDate(a.date)?.getTime() || 0) -
          (parseIncomeDate(b.date)?.getTime() || 0);
      }
      if (sortBy === "amount-high") {
        return Number(b.amount || 0) - Number(a.amount || 0);
      }
      if (sortBy === "amount-low") {
        return Number(a.amount || 0) - Number(b.amount || 0);
      }
      return (parseIncomeDate(b.date)?.getTime() || 0) -
        (parseIncomeDate(a.date)?.getTime() || 0);
    });
  }, [income, search, selectedYear, selectedMonth, sortBy]);

  const deleteIncome = (id) => {
    setIncome((items) => items.filter((item) => item.id !== id));
  };

  const exportIncome = () => {
    const escapeCsv = (value) => {
      const text = String(value ?? "");
      const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText.replace(/"/g, '""')}"`;
    };
    const rows = [
      ["Date", "Source", "Amount (INR)"],
      ...filteredIncome.map((item) => [
        formatDate(item.date),
        item.title,
        Number(item.amount || 0).toFixed(2),
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "income-entries.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <Layout>
      <main className="income-management">
        <header className="income-page-heading">
          <div>
            <span className="income-page-kicker">YOUR EARNINGS</span>
            <h1>Income <span>Management</span></h1>
            <p>Track your earnings effortlessly and stay on top of your income.</p>
          </div>
          <div className="income-page-total">
            <div className="income-total-icon"><FaArrowDown /></div>
            <div>
              <span>ALL-TIME INCOME</span>
              <strong>{formatMoney(totalIncome)}</strong>
            </div>
          </div>
        </header>

        <div className="income-management-grid">
          <IncomeForm />

          <section className="income-entries-card">
            <header className="income-entries-heading">
              <div>
                <span className="income-section-kicker">YOUR RECORDS</span>
                <h2>Income Entries</h2>
                <p>{filteredIncome.length} {filteredIncome.length === 1 ? "entry" : "entries"}</p>
              </div>
              <div className="income-entry-summary">
                <span>This month</span>
                <strong>{formatMoney(currentMonthIncome)}</strong>
              </div>
            </header>

            <div className="income-toolbar">
              <label className="income-search">
                <FaSearch aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search income"
                  aria-label="Search income entries"
                />
              </label>
              <label className="income-filter">
                <span className="visually-hidden">Sort income entries</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="amount-high">Amount: high to low</option>
                  <option value="amount-low">Amount: low to high</option>
                </select>
              </label>
              <label className="income-filter income-year-filter">
                <span className="visually-hidden">Filter by year</span>
                <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
                  <option value="all">All years</option>
                  {years.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </label>
              <label className="income-filter income-month-filter">
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
                className="income-export-button"
                onClick={exportIncome}
                disabled={filteredIncome.length === 0}
              >
                <FaDownload aria-hidden="true" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="income-table-wrap">
              <table className="income-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th className="income-actions-heading">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncome.length === 0 ? (
                    <tr>
                      <td className="income-empty-state" colSpan="5">
                        {income.length === 0
                          ? "Your income entries will appear here after you add your first one."
                          : "No income entries match these filters."}
                      </td>
                    </tr>
                  ) : (
                    filteredIncome.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDate(item.date)}</td>
                        <td className="income-source-cell">{item.title || "Untitled source"}</td>
                        <td className="income-amount-cell">{formatMoney(item.amount)}</td>
                        <td><span className="income-currency-tag">INR</span></td>
                        <td className="income-actions-cell">
                          <button
                            type="button"
                            className="income-delete-button"
                            onClick={() => deleteIncome(item.id)}
                            aria-label={`Delete ${item.title || "income entry"}`}
                            title="Delete income entry"
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
            <footer className="income-table-footer">
              <span>Showing {filteredIncome.length} of {income.length} income entries</span>
              <span>Amounts shown in Indian Rupees</span>
            </footer>
          </section>
        </div>
      </main>
    </Layout>
  );
}

export default Income;
