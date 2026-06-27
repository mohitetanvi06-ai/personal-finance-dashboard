function TransactionTable({ transactions }) {
  return (
    <div className="card shadow mt-4">
      <div className="card-body">
        <h4 className="mb-3">Transactions</h4>

        <div className="table-responsive">
          <table className="table table-hover table-bordered align-middle">

            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    No Transactions Found
                  </td>
                </tr>
              ) : (
                transactions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>{item.title}</td>
                    <td>{item.category || "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          item.type === "Income"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td>₹ {item.amount}</td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

export default TransactionTable;