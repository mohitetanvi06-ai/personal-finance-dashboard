import Layout from "../components/Layout";
import ExpenseForm from "../components/ExpenseForm";

import { useContext } from "react";
import { FinanceContext } from "../context/FinanceContext";

function Expense() {
  const { expense, setExpense } = useContext(FinanceContext);

  const deleteExpense = (id) => {
    const updated = expense.filter((item) => item.id !== id);
    setExpense(updated);
  };

  return (
    <Layout>

      <ExpenseForm />

      <div className="card mt-4 shadow">
        <div className="card-body">

          <h4>Expense List</h4>

          <table className="table table-hover">

            <thead className="table-dark">

              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {expense.map((item) => (
                <tr key={item.id}>

                  <td>{item.date}</td>

                  <td>{item.title}</td>

                  <td>{item.category}</td>

                  <td>₹ {item.amount}</td>

                  <td>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteExpense(item.id)}
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      </div>

    </Layout>
  );
}

export default Expense;