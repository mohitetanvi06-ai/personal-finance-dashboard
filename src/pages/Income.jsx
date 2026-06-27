import Layout from "../components/Layout";
import IncomeForm from "../components/IncomeForm";
import { useContext } from "react";
import { FinanceContext } from "../context/FinanceContext";

function Income() {

  const { income, setIncome } = useContext(FinanceContext);

  const deleteIncome = (id) => {
    const updated = income.filter(item => item.id !== id);
    setIncome(updated);
  };

  return (

    <Layout>

      <IncomeForm />

      <div className="card mt-4 shadow">

        <div className="card-body">

          <h4>Income List</h4>

          <table className="table">

            <thead>

              <tr>

                <th>Date</th>
                <th>Source</th>
                <th>Amount</th>
                <th>Action</th>

              </tr>

            </thead>

            <tbody>

              {
                income.map(item => (

                  <tr key={item.id}>

                    <td>{item.date}</td>

                    <td>{item.title}</td>

                    <td>₹ {item.amount}</td>

                    <td>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteIncome(item.id)}
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))
              }

            </tbody>

          </table>

        </div>

      </div>

    </Layout>

  );
}

export default Income;