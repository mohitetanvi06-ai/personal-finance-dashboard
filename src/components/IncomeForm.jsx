import { useContext, useState } from "react";
import { FinanceContext } from "../context/FinanceContext";

function IncomeForm() {

  const { income, setIncome } = useContext(FinanceContext);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {

    e.preventDefault();

    if (title === "" || amount === "") {
      alert("Please fill all fields");
      return;
    }

    const newIncome = {
      id: Date.now(),
      title,
      amount: Number(amount),
      date: new Date().toLocaleDateString()
    };

    setIncome([...income, newIncome]);

    setTitle("");
    setAmount("");
  };

  return (

    <div className="card shadow p-4">

      <h3>Add Income</h3>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Income Source"
          className="form-control my-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          className="form-control my-3"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button className="btn btn-success w-100">
          Add Income
        </button>

      </form>

    </div>

  );
}

export default IncomeForm;