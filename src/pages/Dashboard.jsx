import { useContext, useState } from "react";

import Layout from "../components/Layout";
import DashboardCard from "../components/DashboardCard";
import TransactionTable from "../components/TransactionTable";
import SearchBar from "../components/SearchBar";
import BudgetProgress from "../components/BudgetProgress";

import { FinanceContext } from "../context/FinanceContext";

import {
  FaWallet,
  FaArrowDown,
  FaArrowUp,
  FaPiggyBank
} from "react-icons/fa";

function Dashboard() {

  const { income, expense } = useContext(FinanceContext);

  const [search, setSearch] = useState("");

  const totalIncome = income.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalExpense = expense.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const balance = totalIncome - totalExpense;

  const transactions = [

    ...income.map((item) => ({
      ...item,
      type: "Income",
      category: "-"
    })),

    ...expense.map((item) => ({
      ...item,
      type: "Expense"
    }))

  ];

  transactions.sort((a, b) => b.id - a.id);

  const filteredTransactions = transactions.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <Layout>

      <div className="row">

        <DashboardCard
          title="Balance"
          amount={balance}
          bgColor="bg-primary"
          icon={<FaWallet />}
        />

        <DashboardCard
          title="Income"
          amount={totalIncome}
          bgColor="bg-success"
          icon={<FaArrowDown />}
        />

        <DashboardCard
          title="Expense"
          amount={totalExpense}
          bgColor="bg-danger"
          icon={<FaArrowUp />}
        />

        <DashboardCard
          title="Savings"
          amount={balance}
          bgColor="bg-warning"
          icon={<FaPiggyBank />}
        />

      </div>

      <SearchBar
        search={search}
        setSearch={setSearch}
      />

      <TransactionTable
        transactions={filteredTransactions}
      />

    </Layout>

  );
}

export default Dashboard;