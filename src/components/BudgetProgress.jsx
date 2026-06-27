function BudgetProgress({ budget, expense }) {
  const percentage =
    budget > 0 ? Math.min((expense / budget) * 100, 100) : 0;

  return (
    <div className="card shadow mt-4">
      <div className="card-body">

        <h4>Monthly Budget</h4>

        <p className="mb-2">
          ₹ {expense} / ₹ {budget}
        </p>

        <div className="progress" style={{ height: "25px" }}>
          <div
            className={`progress-bar ${
              percentage > 80 ? "bg-danger" : "bg-success"
            }`}
            role="progressbar"
            style={{ width: `${percentage}%` }}
          >
            {percentage.toFixed(0)}%
          </div>
        </div>

      </div>
    </div>
  );
}

export default BudgetProgress;