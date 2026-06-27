import { FaBell, FaUserCircle } from "react-icons/fa";

function Navbar() {
  return (
    <div className="top-navbar shadow-sm">

      <h3>
        Personal Finance Dashboard
      </h3>

      <div className="profile">

        <FaBell />

        <FaUserCircle size={30} />

      </div>

    </div>
  );
}

export default Navbar;