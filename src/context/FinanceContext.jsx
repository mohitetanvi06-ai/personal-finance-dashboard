import { createContext, useState, useEffect } from "react";

export const FinanceContext = createContext();

function FinanceProvider({ children }) {

  const [income, setIncome] = useState(() => {
    const savedIncome = localStorage.getItem("income");
    return savedIncome ? JSON.parse(savedIncome) : [];
  });

  const [expense, setExpense] = useState(() => {
    const savedExpense = localStorage.getItem("expense");
    return savedExpense ? JSON.parse(savedExpense) : [];
  });

  useEffect(() => {
    localStorage.setItem("income", JSON.stringify(income));
  }, [income]);

  useEffect(() => {
    localStorage.setItem("expense", JSON.stringify(expense));
  }, [expense]);

  return (
    <FinanceContext.Provider
      value={{
        income,
        setIncome,
        expense,
        setExpense,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export default FinanceProvider;