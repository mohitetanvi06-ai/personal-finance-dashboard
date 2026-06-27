import { useContext, useState } from "react";
import { FinanceContext } from "../context/FinanceContext";

function ExpenseForm() {
  const { expense, setExpense } = useContext(FinanceContext);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (title === "" || amount === "") {
      alert("Please fill all fields");
      return;
    }

    const newExpense = {
      id: Date.now(),
      title,
      category,
      amount: Number(amount),
      date: new Date().toLocaleDateString(),
    };

    setExpense([...expense, newExpense]);

    setTitle("");
    setCategory("Food");
    setAmount("");
  };

  return (
    <div className="card shadow p-4">
      <h3>Add Expense</h3>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-control my-2"
          placeholder="Expense Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          className="form-select my-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Food</option>
          <option>Transport</option>
          <option>Shopping</option>
          <option>Bills</option>
          <option>Education</option>
          <option>Entertainment</option>
          <option>Health</option>
        </select>

        <input
          type="number"
          className="form-control my-2"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button className="btn btn-danger w-100 mt-3">
          Add Expense
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;