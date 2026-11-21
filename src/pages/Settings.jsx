import { useContext, useState } from "react";
import {
  FaBell,
  FaCalendarAlt,
  FaChartLine,
  FaCheck,
  FaDownload,
  FaEnvelope,
  FaLock,
  FaMoneyBillWave,
  FaRedoAlt,
  FaShieldAlt,
  FaUser,
} from "react-icons/fa";

import Layout from "../components/Layout";
import { FinanceContext } from "../context/FinanceDataContext";

import "./Settings.css";

function Settings() {
  const {
    income = [],
    expense = [],
    budgets = [],
    bills = [],
    savingsGoals = [],
    savingsDeposits = [],
    calendarNotes = {},
    preferences: savedPreferences = {},
    setIncome,
    setExpense,
    setBudgets,
    setBills,
    setSavingsGoals,
    setSavingsDeposits,
    setCalendarNotes,
    setPreferences,
  } = useContext(FinanceContext);
  const [preferences, updatePreferences] = useState(() => ({
    profileName: "",
    profileEmail: "",
    budget: "",
    smartAlerts: false,
    weeklyReports: false,
    largeTransactions: true,
    monthlyReports: false,
    ...savedPreferences,
  }));
  const [notice, setNotice] = useState("");

  const updatePreference = (key, value) => {
    updatePreferences((current) => ({ ...current, [key]: value }));
    setNotice("");
  };

  const saveSettings = (event) => {
    event.preventDefault();
    const monthlyBudget = preferences.budget.trim();
    if (monthlyBudget && (!Number.isFinite(Number(monthlyBudget)) || Number(monthlyBudget) <= 0)) {
      setNotice("Enter a valid monthly planning amount, or leave it blank.");
      return;
    }

    if (preferences.profileEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(preferences.profileEmail)) {
      setNotice("Enter a valid email address, or leave it blank.");
      return;
    }

    setPreferences({
      ...preferences,
      profileName: preferences.profileName.trim(),
      profileEmail: preferences.profileEmail.trim(),
      budget: monthlyBudget ? String(Number(monthlyBudget)) : "",
    });
    setNotice("Your preferences have been saved to your account.");
  };

  const exportBackup = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      profile: {
        name: preferences.profileName,
        email: preferences.profileEmail,
      },
      preferences: {
        monthlyBudget: preferences.budget,
        smartAlerts: preferences.smartAlerts,
        weeklyReports: preferences.weeklyReports,
        largeTransactions: preferences.largeTransactions,
        monthlyReports: preferences.monthlyReports,
      },
      financeData: {
        income,
        expenses: expense,
        budgets,
        savingsGoals,
        savingsDeposits,
        billPayments: bills,
        calendarNotes,
      },
    };
    const url = URL.createObjectURL(new Blob(
      [JSON.stringify(backup, null, 2)],
      { type: "application/json" }
    ));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "finance-dashboard-backup.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const resetFinanceData = () => {
    if (!window.confirm("Delete all income, expenses, budgets, bills, savings goals, saved savings and calendar notes from your account? This cannot be undone.")) {
      return;
    }
    setIncome([]);
    setExpense([]);
    setBudgets([]);
    setBills([]);
    setSavingsGoals([]);
    setSavingsDeposits([]);
    setCalendarNotes({});
    setNotice("Your finance records have been cleared.");
  };

  const settingOptions = [
    {
      key: "smartAlerts",
      label: "Budget limit reminders",
      description: "Preference for reminders when a category nears its limit.",
      icon: <FaBell />,
    },
    {
      key: "weeklyReports",
      label: "Weekly money summary",
      description: "Preference for a weekly overview of your activity.",
      icon: <FaChartLine />,
    },
    {
      key: "largeTransactions",
      label: "Large expense reminders",
      description: "Preference for highlighting larger recorded expenses.",
      icon: <FaMoneyBillWave />,
    },
    {
      key: "monthlyReports",
      label: "Monthly review",
      description: "Preference for a month-end income and expense recap.",
      icon: <FaCalendarAlt />,
    },
  ];

  return (
    <Layout>
      <main className="settings-management">
        <header className="settings-page-heading">
          <div>
            <span className="settings-page-kicker">MAKE IT YOURS</span>
            <h1>Settings <span>&amp; preferences</span></h1>
            <p>Manage your profile, planning preferences and account finance data.</p>
          </div>
          <div className="settings-device-badge">
            <FaShieldAlt aria-hidden="true" />
            <span>Secure account storage</span>
          </div>
        </header>

        <form className="settings-form" onSubmit={saveSettings}>
          <section className="settings-section-card">
            <header className="settings-section-heading">
              <span className="settings-section-icon profile"><FaUser /></span>
              <div>
                <h2>Profile</h2>
                <p>Personalize your finance workspace.</p>
              </div>
            </header>

            <div className="settings-profile-fields">
              <label className="settings-field">
                <span>Your name</span>
                <input
                  type="text"
                  maxLength={70}
                  value={preferences.profileName}
                  onChange={(event) => updatePreference("profileName", event.target.value)}
                  placeholder="e.g. Alex"
                />
              </label>
              <label className="settings-field">
                <span>Email address <small>Optional</small></span>
                <div className="settings-input-with-icon">
                  <FaEnvelope aria-hidden="true" />
                  <input
                    type="email"
                    maxLength={254}
                    value={preferences.profileEmail}
                    onChange={(event) => updatePreference("profileEmail", event.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </label>
            </div>
          </section>

          <section className="settings-section-card">
            <header className="settings-section-heading">
              <span className="settings-section-icon finance"><FaMoneyBillWave /></span>
              <div>
                <h2>Finance preferences</h2>
                <p>Set a planning reference for your finances.</p>
              </div>
            </header>

            <div className="settings-finance-fields">
              <label className="settings-field">
                <span>Monthly planning amount <small>Optional</small></span>
                <div className="settings-amount-input">
                  <span aria-hidden="true">₹</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={preferences.budget}
                    onChange={(event) => updatePreference("budget", event.target.value)}
                    placeholder="Set a monthly reference"
                  />
                </div>
                <small className="settings-field-hint">
                  This is a planning reference; category budgets are managed separately.
                </small>
              </label>
              <div className="settings-currency-info">
                <span>Display currency</span>
                <strong>INR <small>Indian Rupee</small></strong>
                <p>This dashboard currently records and displays amounts in INR.</p>
              </div>
            </div>
          </section>

          <section className="settings-section-card">
            <header className="settings-section-heading">
              <span className="settings-section-icon alerts"><FaBell /></span>
              <div>
                <h2>Alert preferences</h2>
                <p>Choose which reminders you’d like to keep enabled.</p>
              </div>
            </header>

            <div className="settings-alert-list">
              {settingOptions.map((option) => (
                <div className="settings-alert-row" key={option.key}>
                  <span className="settings-alert-icon">{option.icon}</span>
                  <div className="settings-alert-copy">
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences[option.key]}
                    aria-label={option.label}
                    className={`settings-switch ${preferences[option.key] ? "active" : ""}`}
                    onClick={() => updatePreference(option.key, !preferences[option.key])}
                  >
                    <span />
                  </button>
                </div>
              ))}
            </div>
            <p className="settings-local-note">
              These choices are saved to your account. Email, push and SMS delivery are not connected yet.
            </p>
          </section>

          <section className="settings-section-card settings-data-card">
            <header className="settings-section-heading">
              <span className="settings-section-icon security"><FaLock /></span>
              <div>
                <h2>Data &amp; privacy</h2>
                <p>Your finance records are saved to your account in the database.</p>
              </div>
            </header>
            <div className="settings-data-actions">
              <div>
                <strong>Keep a backup of your records</strong>
                <small>Download income, expenses, budgets, bills, savings goals and calendar notes as JSON.</small>
              </div>
              <button type="button" className="settings-secondary-button" onClick={exportBackup}>
                <FaDownload aria-hidden="true" />
                Export backup
              </button>
            </div>
            <div className="settings-data-actions settings-reset-row">
              <div>
                <strong>Clear finance data</strong>
                <small>Remove your account transactions, budgets, bills, savings goals and calendar notes.</small>
              </div>
              <button type="button" className="settings-reset-button" onClick={resetFinanceData}>
                <FaRedoAlt aria-hidden="true" />
                Reset finance data
              </button>
            </div>
          </section>

          <footer className="settings-form-footer">
            <div className="settings-save-message" role="status" aria-live="polite">
              {notice && (
                <>
                  {notice.includes("saved") && <FaCheck aria-hidden="true" />}
                  <span>{notice}</span>
                </>
              )}
            </div>
            <button className="settings-save-button" type="submit">
              Save preferences
            </button>
          </footer>
        </form>
      </main>
    </Layout>
  );
}

export default Settings;
