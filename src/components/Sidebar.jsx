import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaWallet,
  FaMoneyBillWave,
  FaChartPie,
  FaCog
} from "react-icons/fa";

function Sidebar() {
  return (
    <div className="sidebar">

      <h2 className="logo">
        💰 Finance
      </h2>

      <NavLink to="/">
        <FaHome />
        Dashboard
      </NavLink>

      <NavLink to="/income">
        <FaWallet />
        Income
      </NavLink>

      <NavLink to="/expense">
        <FaMoneyBillWave />
        Expense
      </NavLink>

      <NavLink to="/reports">
        <FaChartPie />
        Reports
      </NavLink>

      <NavLink to="/settings">
        <FaCog />
        Settings
      </NavLink>

    </div>
  );
}

export default Sidebar;