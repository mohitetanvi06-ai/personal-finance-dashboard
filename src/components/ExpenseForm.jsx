import { useContext, useState } from "react";
import { FaCalendarAlt, FaReceipt } from "react-icons/fa";

import { FinanceContext } from "../context/FinanceDataContext";
import { expenseAPI } from "../services/api";

const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "EMI",
  "Education",
  "Entertainment",
  "Health",
];

function getToday() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  return new Date(today.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function ExpenseForm() {
  const { income = [], expense = [], setExpense } = useContext(FinanceContext);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getToday);
  const totalIncome = income.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const totalExpenses = expense.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const availableBalance = totalIncome - totalExpenses;
  const formatMoney = (value) => `₹${Math.max(0, value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!title.trim()) {
      window.alert("Please enter an expense description.");
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || !date) {
      window.alert("Please enter a valid amount and date.");
      return;
    }
    if (availableBalance <= 0) {
      window.alert(`You don't have any available balance (${formatMoney(availableBalance)}). Add income or remove an expense before adding a new expense.`);
      return;
    }
    if (numericAmount > availableBalance) {
      window.alert(`This expense is more than your available balance of ${formatMoney(availableBalance)}. Reduce the amount or add income first.`);
      return;
    }

    const newExpense = {
      title: title.trim(),
      category,
      amount: numericAmount,
      date,
      description: "",
    };

    try {
      const savedExpense = await expenseAPI.add(newExpense);
      setExpense((items) => [...items, savedExpense]);
      setTitle("");
      setCategory("Food");
      setAmount("");
      setDate(getToday());
    } catch (err) {
      console.error("Failed to save expense:", err);
      // Fallback to local state if offline/demo
      setExpense((items) => [...items, { ...newExpense, id: Date.now() }]);
      setTitle("");
      setCategory("Food");
      setAmount("");
      setDate(getToday());
    }
  };

  return (
    <section className="expense-entry-card">
      <header className="expense-form-heading">
        <div className="expense-form-icon"><FaReceipt /></div>
        <div>
          <h2>Add Expense Entry</h2>
          <p>Log a purchase and keep your spending organized.</p>
        </div>
      </header>

      <form className="expense-entry-form" onSubmit={handleSubmit}>
        <label className="expense-field expense-field-full">
          <span>Expense description</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Grocery shopping"
            maxLength={80}
            required
          />
        </label>

        <label className="expense-field">
          <span>Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
          >
            {EXPENSE_CATEGORIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <small>Choose the closest spending category.</small>
        </label>

        <label className="expense-field">
          <span>Amount</span>
          <div className="expense-amount-input">
            <span aria-hidden="true">₹</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <small>
            Available balance: {formatMoney(availableBalance)}. Expense cannot exceed this amount.
          </small>
        </label>

        <label className="expense-field expense-field-full">
          <span>Date of expense</span>
          <div className="expense-date-input">
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
            <FaCalendarAlt aria-hidden="true" />
          </div>
          <small>Choose when the purchase was made.</small>
        </label>

        <div className="expense-currency-note">
          <span>Currency</span>
          <strong>INR <small>Indian Rupee</small></strong>
        </div>

        <button className="expense-submit-button" type="submit">
          <FaReceipt aria-hidden="true" />
          Add expense entry
        </button>
      </form>
    </section>
  );
}

export default ExpenseForm;
