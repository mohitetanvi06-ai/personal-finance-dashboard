import { useContext, useState } from "react";
import { FaCalendarAlt, FaCoins } from "react-icons/fa";

import { FinanceContext } from "../context/FinanceDataContext";
import { incomeAPI } from "../services/api";

function getToday() {
  const today = new Date();
  const offset = today.getTimezoneOffset();

  return new Date(today.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 10);
}

function IncomeForm() {
  const { setIncome } = useContext(FinanceContext);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getToday);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!title.trim()) {
      window.alert("Please enter an income source.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || !date) {
      window.alert("Please enter a valid amount and date.");
      return;
    }

    const newIncome = {
      source: title.trim(),
      category: "Other",
      amount: numericAmount,
      date,
      description: "",
    };

    try {
      setLoading(true);

      const savedIncome = await incomeAPI.add(newIncome);

      const formattedIncome = {
        ...savedIncome,
        title: savedIncome.source,
      };

      setIncome((items) => [...items, formattedIncome]);

      setTitle("");
      setAmount("");
      setDate(getToday());

      window.alert("Income added successfully!");
    } catch (error) {
      console.error("Error adding income:", error);
      window.alert("Failed to add income. Please check the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="income-entry-card">
      <header className="income-form-heading">
        <div className="income-form-icon">
          <FaCoins />
        </div>

        <div>
          <h2>Add Income Entry</h2>
          <p>Record a new earning in a few quick steps.</p>
        </div>
      </header>

      <form className="income-entry-form" onSubmit={handleSubmit}>
        <label className="income-field income-field-full">
          <span>Income source</span>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Salary, Freelance"
            maxLength={80}
            required
          />
        </label>

        <label className="income-field">
          <span>Amount</span>

          <div className="income-amount-input">
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

          <small>Enter the amount received.</small>
        </label>

        <label className="income-field">
          <span>Date received</span>

          <div className="income-date-input">
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />

            <FaCalendarAlt aria-hidden="true" />
          </div>

          <small>Choose when you received it.</small>
        </label>

        <div className="income-currency-note">
          <span>Currency</span>

          <strong>
            INR <small>Indian Rupee</small>
          </strong>
        </div>

        <button
          className="income-submit-button"
          type="submit"
          disabled={loading}
        >
          <FaCoins aria-hidden="true" />

          {loading ? "Saving..." : "Add income entry"}
        </button>
      </form>
    </section>
  );
}

export default IncomeForm;