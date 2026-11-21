import { useContext } from "react";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { FinanceContext } from "../context/FinanceDataContext";
import NotificationBell from "./NotificationBell";
import "./Navbar.css";

function Navbar() {
  const { currentUser, logout } = useContext(FinanceContext);

  return (
    <div className="top-navbar shadow-sm">
      <div className="brand-block">
        <span className="brand-pill">FinanceOS</span>
        <h3>Personal Finance Dashboard</h3>
      </div>

      <div className="header-actions">
        {currentUser && (
          <div className="profile d-flex align-items-center gap-3">
            <NotificationBell />
            <div className="d-flex align-items-center gap-2">
              <FaUserCircle size={24} className="text-primary" />
              <span className="fw-semibold text-secondary" style={{ fontSize: "0.9rem" }}>
                {currentUser.name || currentUser.email}
              </span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 ms-1"
              style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", borderRadius: "6px" }}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;