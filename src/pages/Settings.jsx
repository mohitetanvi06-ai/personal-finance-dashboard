import Layout from "../components/Layout";
import { useContext, useState } from "react";

import { ThemeContext } from "../context/ThemeContext";

function Settings() {

  const { theme, toggleTheme } =
    useContext(ThemeContext);

  const [budget, setBudget] = useState(
    localStorage.getItem("budget") || 50000
  );

  const [currency, setCurrency] = useState(
    localStorage.getItem("currency") || "INR"
  );

  const saveSettings = () => {

    localStorage.setItem("budget", budget);

    localStorage.setItem("currency", currency);

    alert("Settings Saved Successfully");

  };

  const resetData = () => {

    if (
      window.confirm(
        "Delete all Finance Data?"
      )
    ) {

      localStorage.clear();

      window.location.reload();

    }

  };

  return (

    <Layout>

      <div className="card shadow p-4">

        <h2>Settings</h2>

        <hr />

        <div className="mb-4">

          <label className="form-label">

            Monthly Budget

          </label>

          <input
            className="form-control"
            value={budget}
            onChange={(e) =>
              setBudget(e.target.value)
            }
          />

        </div>

        <div className="mb-4">

          <label>

            Currency

          </label>

          <select
            className="form-select"
            value={currency}
            onChange={(e) =>
              setCurrency(e.target.value)
            }
          >

            <option>INR</option>

            <option>USD</option>

            <option>EUR</option>

          </select>

        </div>

        <div className="mb-4">

          <button
            className="btn btn-dark"
            onClick={toggleTheme}
          >

            {theme === "light"
              ? "Enable Dark Mode"
              : "Enable Light Mode"}

          </button>

        </div>

        <button
          className="btn btn-primary me-3"
          onClick={saveSettings}
        >

          Save Settings

        </button>

        <button
          className="btn btn-danger"
          onClick={resetData}
        >

          Reset All Data

        </button>

      </div>

    </Layout>

  );

}

export default Settings;