import React from "react";

function DashboardCard({ title, amount, bgColor, icon }) {
  return (
    <div className="col-lg-3 col-md-6 mb-4">
      <div className={`card text-white ${bgColor} shadow border-0`}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6>{title}</h6>
              <h3>₹ {amount}</h3>
            </div>

            <div style={{ fontSize: "40px" }}>
              {icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard;