import { useState, useEffect, useCallback } from "react";
import { FinanceContext } from "./FinanceDataContext";
import {
  authAPI,
  financeAPI,
  migrationAPI,
  getStoredUser,
} from "../services/api";

const OLD_STORAGE_KEY = "personalFinanceDashboardData";

const EMPTY_FINANCE_DATA = {
  income: [],
  expense: [],
  budgets: [],
  bills: [],
  savingsGoals: [],
  savingsDeposits: [],
  calendarNotes: {},
  preferences: {},
};

function normalizeFinanceData(data = {}) {
  // Normalize income (ensure title exists)
  const incomeList = Array.isArray(data.income)
    ? data.income.map((item) => ({
        ...item,
        title: item.title || item.source || "Income",
      }))
    : [];

  // Normalize expenses
  const expenseList = Array.isArray(data.expense)
    ? data.expense.map((item) => ({
        ...item,
        title: item.title || "Expense",
      }))
    : [];

  return {
    income: incomeList,
    expense: expenseList,
    budgets: Array.isArray(data.budgets) ? data.budgets : [],
    bills: Array.isArray(data.bills) ? data.bills : [],
    savingsGoals: Array.isArray(data.savingsGoals) ? data.savingsGoals : [],
    savingsDeposits: Array.isArray(data.savingsDeposits) ? data.savingsDeposits : [],
    calendarNotes:
      data.calendarNotes && typeof data.calendarNotes === "object" && !Array.isArray(data.calendarNotes)
        ? data.calendarNotes
        : {},
    preferences:
      data.preferences && typeof data.preferences === "object" && !Array.isArray(data.preferences)
        ? data.preferences
        : {},
  };
}

function getOldLocalStorageData() {
  try {
    const saved = localStorage.getItem(OLD_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    const inc = JSON.parse(localStorage.getItem("income") || "[]");
    const exp = JSON.parse(localStorage.getItem("expense") || "[]");
    if (inc.length > 0 || exp.length > 0) {
      return { income: inc, expense: exp };
    }
  } catch (err) {
    console.warn("Could not read legacy localStorage data", err);
  }
  return null;
}

function FinanceProvider({ children }) {
  const [financeData, setFinanceData] = useState(EMPTY_FINANCE_DATA);
  const [loading, setLoading] = useState(() => authAPI.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(getStoredUser);

  const reloadData = useCallback(async () => {
    if (!authAPI.isAuthenticated()) return;
    try {
      const data = await financeAPI.getAll();
      setFinanceData(normalizeFinanceData(data));
    } catch (err) {
      console.error("Failed to reload data:", err);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadInitialData() {
      if (!authAPI.isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const data = await financeAPI.getAll();
        if (ignore) return;

        const oldLocalData = getOldLocalStorageData();
        const isBackendEmpty =
          (!data.income || data.income.length === 0) &&
          (!data.expense || data.expense.length === 0) &&
          (!data.bills || data.bills.length === 0);

        if (oldLocalData && isBackendEmpty) {
          try {
            await migrationAPI.importData(oldLocalData);
            localStorage.removeItem(OLD_STORAGE_KEY);
            localStorage.removeItem("income");
            localStorage.removeItem("expense");
            const reloaded = await financeAPI.getAll();
            if (!ignore) {
              setFinanceData(normalizeFinanceData(reloaded));
            }
          } catch (migErr) {
            console.error("Migration error:", migErr);
            if (!ignore) setFinanceData(normalizeFinanceData(data));
          }
        } else {
          setFinanceData(normalizeFinanceData(data));
        }
      } catch (err) {
        console.error("Failed to load finance data from backend:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
          setCurrentUser(getStoredUser());
        }
      }
    }

    loadInitialData();

    return () => {
      ignore = true;
    };
  }, []);

  const updateSection = (section) => (update) => {
    setFinanceData((current) => ({
      ...current,
      [section]: typeof update === "function" ? update(current[section]) : update,
    }));
  };

  const handleLogout = () => {
    authAPI.logout();
    setFinanceData(EMPTY_FINANCE_DATA);
    setCurrentUser(null);
    window.location.href = "/login";
  };

  return (
    <FinanceContext.Provider
      value={{
        ...financeData,
        loading,
        currentUser,
        refreshFinanceData: reloadData,
        logout: handleLogout,
        setIncome: updateSection("income"),
        setExpense: updateSection("expense"),
        setBudgets: updateSection("budgets"),
        setBills: updateSection("bills"),
        setSavingsGoals: updateSection("savingsGoals"),
        setSavingsDeposits: updateSection("savingsDeposits"),
        setCalendarNotes: updateSection("calendarNotes"),
        setPreferences: updateSection("preferences"),
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export default FinanceProvider;