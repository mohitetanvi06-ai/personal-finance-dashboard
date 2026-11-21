import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import {
  FaHome,
  FaWallet,
  FaMoneyBillWave,
  FaChartPie,
  FaCog,
  FaPiggyBank,
  FaCoins,
  FaCalendarCheck,
  FaLightbulb,
} from "react-icons/fa";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">💰 Finance</h2>

      <NavLink to="/" end>
        <FaHome />
        <span>Dashboard</span>
      </NavLink>

      <NavLink to="/income">
        <FaWallet />
        <span>Income</span>
      </NavLink>

      <NavLink to="/expense">
        <FaMoneyBillWave />
        <span>Expense</span>
      </NavLink>

      <NavLink to="/budget">
        <FaCoins />
        <span>Budget Management</span>
      </NavLink>

      <NavLink to="/bills">
        <FaCalendarCheck />
        <span>Bills &amp; EMI</span>
      </NavLink>

      <NavLink to="/savings-goals">
        <FaPiggyBank />
        <span>Savings Goals</span>
      </NavLink>

      <NavLink to="/money-management">
        <FaLightbulb />
        <span>Money Management</span>
      </NavLink>

      <NavLink to="/reports">
        <FaChartPie />
        <span>Reports & Analytics</span>
      </NavLink>

      <NavLink to="/settings">
        <FaCog />
        <span>Settings</span>
      </NavLink>
    </div>
  );
}

export default Sidebar;