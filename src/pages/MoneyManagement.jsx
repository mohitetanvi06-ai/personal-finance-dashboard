import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowDown,
  FaArrowRight,
  FaArrowUp,
  FaBalanceScale,
  FaCalendarCheck,
  FaChartLine,
  FaCheckCircle,
  FaComments,
  FaCreditCard,
  FaExclamationTriangle,
  FaLightbulb,
  FaPaperPlane,
  FaPiggyBank,
  FaRobot,
  FaTimes,
} from "react-icons/fa";

import Layout from "../components/Layout";
import { FinanceContext } from "../context/FinanceDataContext";
import "./MoneyManagement.css";

function parseDate(value) {
  if (!value) return null;
  const text = String(value).trim();
  const isoDate = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  if (isoDate) {
    const date = new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
    return date.getFullYear() === Number(isoDate[1]) &&
      date.getMonth() === Number(isoDate[2]) - 1 &&
      date.getDate() === Number(isoDate[3])
      ? date
      : null;
  }

  const localDate = /^(\d{1,2})[/. -](\d{1,2})[/. -](\d{2,4})$/.exec(text);
  if (localDate) {
    const first = Number(localDate[1]);
    const second = Number(localDate[2]);
    const yearValue = Number(localDate[3]);
    const year = yearValue < 100 ? 2000 + yearValue : yearValue;
    const day = first > 12 ? first : second;
    const month = first > 12 ? second : first;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 &&
      date.getDate() === day
      ? date
      : null;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatMoney(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function MoneyManagement() {
  const {
    income = [],
    expense = [],
    budgets = [],
    bills = [],
    savingsGoals = [],
    savingsDeposits = [],
  } = useContext(FinanceContext);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([
    {
      id: 0,
      role: "assistant",
      text: "Hi! I can help you understand your income, spending, budgets, bills, and savings goals. What would you like to review?",
    },
  ]);
  const assistantMessageId = useRef(1);
  const assistantMessagesRef = useRef(null);
  const assistantInputRef = useRef(null);
  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const elapsedDays = now.getDate();
  const isThisMonth = (item) => {
    const date = parseDate(item.date);
    return date && date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth();
  };
  const monthlyIncomeEntries = income.filter(isThisMonth);
  const monthlyIncome = monthlyIncomeEntries
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const monthlyExpenses = expense.filter(isThisMonth);
  const monthlySpending = monthlyExpenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const netCashFlow = monthlyIncome - monthlySpending;
  const isPreviousMonth = (item) => {
    const date = parseDate(item.date);
    return date && date >= previousMonthStart && date <= previousMonthEnd;
  };
  const previousMonthIncome = income.filter(isPreviousMonth)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const previousMonthSpending = expense.filter(isPreviousMonth)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const expenseChange = monthlySpending - previousMonthSpending;
  const incomeChange = monthlyIncome - previousMonthIncome;
  const changeDescription = (current, previous) => {
    if (previous === 0) {
      return current === 0 ? "No change" : "No entries last month";
    }
    const percent = Math.round((Math.abs(current - previous) / previous) * 100);
    if (current === previous) return "No change from last month";
    return `${percent}% ${current > previous ? "higher" : "lower"} than last month`;
  };
  const savingsRate = monthlyIncome > 0
    ? Math.round((netCashFlow / monthlyIncome) * 100)
    : null;
  const hasCurrentMonthData = monthlyIncomeEntries.length > 0 || monthlyExpenses.length > 0;
  const projectedExpenses = hasCurrentMonthData
    ? (monthlySpending / elapsedDays) * daysInMonth
    : null;
  const projectedMonthEndBalance = projectedExpenses !== null
    ? monthlyIncome - projectedExpenses
    : null;
  const allTimeBalance = income.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  ) - expense.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const unpaidBills = bills.filter((bill) => {
    if (bill.status === "completed") return false;
    const dueDate = parseDate(bill.dueDate);
    return dueDate && dueDate <= monthEnd;
  });
  const unpaidBillsTotal = unpaidBills.reduce(
    (sum, bill) => sum + Number(bill.amount || 0),
    0
  );
  const balanceAfterBills = allTimeBalance - unpaidBillsTotal;
  const activeGoals = savingsGoals.filter((goal) => (
    Number(goal.target) > 0 && Number(goal.saved || 0) < Number(goal.target)
  ));
  const totalGoalTarget = savingsGoals.reduce(
    (sum, goal) => sum + Number(goal.target || 0),
    0
  );
  const totalGoalSaved = savingsGoals.reduce(
    (sum, goal) => sum + Number(goal.saved || 0),
    0
  );
  const totalGoalRemaining = activeGoals.reduce(
    (sum, goal) => sum + Math.max(0, Number(goal.target) - Number(goal.saved || 0)),
    0
  );
  const availableSavings = savingsDeposits.reduce(
    (sum, deposit) => sum + Math.max(
      0,
      Number(deposit.remaining ?? deposit.amount) || 0
    ),
    0
  );
  const overallGoalProgress = totalGoalTarget > 0
    ? Math.min(100, Math.round((totalGoalSaved / totalGoalTarget) * 100))
    : 0;
  const totalBudget = budgets.reduce(
    (sum, budget) => sum + Number(budget.amount || 0),
    0
  );
  const budgetUsage = totalBudget > 0
    ? Math.round((monthlySpending / totalBudget) * 100)
    : null;

  const spendingByCategory = monthlyExpenses.reduce((totals, item) => {
    const category = String(item.category || "Other").trim() || "Other";
    const normalized = category.toLowerCase();
    const current = totals[normalized] || { name: category, amount: 0 };
    totals[normalized] = {
      ...current,
      amount: current.amount + Number(item.amount || 0),
    };
    return totals;
  }, {});
  const categorySpending = Object.values(spendingByCategory)
    .sort((a, b) => b.amount - a.amount);
  const budgetReviews = budgets.map((budget) => {
    const category = String(budget.category || "").trim();
    const spent = spendingByCategory[category.toLowerCase()]?.amount || 0;
    const limit = Number(budget.amount || 0);
    return {
      category,
      spent,
      limit,
      percent: limit > 0 ? Math.round((spent / limit) * 100) : 0,
    };
  }).filter((budget) => budget.category && budget.limit > 0)
    .sort((a, b) => b.percent - a.percent);
  const overBudget = budgetReviews.filter((budget) => budget.spent > budget.limit);
  const nearBudget = budgetReviews.filter((budget) => (
    budget.spent <= budget.limit && budget.percent >= 80
  ));
  const topCategory = categorySpending[0];
  const topCategoryShare = topCategory && monthlySpending > 0
    ? Math.round((topCategory.amount / monthlySpending) * 100)
    : 0;

  useEffect(() => {
    if (isAssistantOpen) {
      assistantInputRef.current?.focus();
    }
  }, [isAssistantOpen]);

  useEffect(() => {
    if (assistantMessagesRef.current) {
      assistantMessagesRef.current.scrollTop = assistantMessagesRef.current.scrollHeight;
    }
  }, [assistantMessages]);

  const getAssistantReply = (question) => {
    const text = question.toLowerCase();
    const matchingGoal = savingsGoals.find((goal) => (
      String(goal.name || "").trim() &&
      text.includes(String(goal.name).toLowerCase())
    ));

    if (/bill|emi|due|बाकी बिल|बिल/.test(text)) {
      return unpaidBills.length
        ? `${unpaidBills.length} unpaid bill${unpaidBills.length === 1 ? "" : "s"} due by month-end total ${formatMoney(unpaidBillsTotal)}. After setting these aside, your recorded balance is ${balanceAfterBills < 0 ? "short by " : ""}${formatMoney(Math.abs(balanceAfterBills))}.`
        : "There are no unpaid bills with a due date by the end of this month.";
    }

    const matchingBudget = budgetReviews.find((budget) => (
      text.includes(budget.category.toLowerCase())
    ));
    if (matchingBudget) {
      const remaining = matchingBudget.limit - matchingBudget.spent;
      return remaining < 0
        ? `${matchingBudget.category} is over its ${formatMoney(matchingBudget.limit)} budget by ${formatMoney(Math.abs(remaining))}. Recorded spending is ${formatMoney(matchingBudget.spent)}.`
        : `${matchingBudget.category} has used ${matchingBudget.percent}% of its ${formatMoney(matchingBudget.limit)} budget. ${formatMoney(remaining)} remains.`;
    }

    if (/budget|limit|बजेट|मर्यादा/.test(text)) {
      if (overBudget.length > 0) {
        return `${overBudget.length} budget ${overBudget.length === 1 ? "category is" : "categories are"} over limit: ${overBudget.slice(0, 3).map((budget) => `${budget.category} by ${formatMoney(budget.spent - budget.limit)}`).join(", ")}.`;
      }
      if (budgetReviews.length > 0) {
        const closest = budgetReviews[0];
        return `No category is over budget. ${closest.category} is closest to its limit at ${closest.percent}% used, with ${formatMoney(Math.max(0, closest.limit - closest.spent))} remaining.`;
      }
      return "You have not set any category budgets yet. Add limits on the Budget Management page to track them here.";
    }

    if (matchingGoal) {
      const target = Number(matchingGoal.target || 0);
      const saved = Number(matchingGoal.saved || 0);
      const remaining = Math.max(0, target - saved);
      const progress = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
      return remaining === 0
        ? `${matchingGoal.name} is complete! You have saved ${formatMoney(saved)} of ${formatMoney(target)}.`
        : `${matchingGoal.name} is ${progress}% complete. ${formatMoney(saved)} saved, with ${formatMoney(remaining)} left to reach the target.`;
    }

    if (/saving goal|savings goal|goal|बचत|ध्येय/.test(text)) {
      return savingsGoals.length
        ? `You have saved ${formatMoney(totalGoalSaved)} of ${formatMoney(totalGoalTarget)} across ${savingsGoals.length} goal${savingsGoals.length === 1 ? "" : "s"} (${overallGoalProgress}% overall). ${formatMoney(totalGoalRemaining)} remains on active goals, and ${formatMoney(availableSavings)} is available to allocate.`
        : `You have ${formatMoney(availableSavings)} in available savings but no goals yet. Create a savings goal when you are ready to track a target.`;
    }

    if (/forecast|estimate|month.end|month end|project|अंदाज|महिनाअखेर/.test(text)) {
      return projectedMonthEndBalance === null
        ? "Add income or expenses for this month to get a month-end estimate."
        : `Based on the current daily expense average, your estimated month-end balance is ${projectedMonthEndBalance < 0 ? "−" : ""}${formatMoney(Math.abs(projectedMonthEndBalance))}. Income is only what you have recorded so far, so this is a rough estimate.`;
    }

    if (/compare|last month|previous month|मागच्या महिन्या|तुलना/.test(text)) {
      return `So far this month: income ${formatMoney(monthlyIncome)} (${changeDescription(monthlyIncome, previousMonthIncome)}) and expenses ${formatMoney(monthlySpending)} (${changeDescription(monthlySpending, previousMonthSpending)}) compared with last month's full totals.`;
    }

    const matchingCategory = categorySpending.find((category) => (
      text.includes(category.name.toLowerCase())
    ));
    if (matchingCategory) {
      const share = monthlySpending > 0
        ? Math.round((matchingCategory.amount / monthlySpending) * 100)
        : 0;
      return `${matchingCategory.name} is ${formatMoney(matchingCategory.amount)} of this month's recorded spending (${share}%).`;
    }

    if (/spend|expense|खर्च|category|कॅटेगरी/.test(text)) {
      return topCategory
        ? `This month you have recorded ${formatMoney(monthlySpending)} in expenses. Your largest category is ${topCategory.name} at ${formatMoney(topCategory.amount)} (${topCategoryShare}% of spending).`
        : "No expenses are recorded for this month yet.";
    }

    if (/income|उत्पन्न/.test(text)) {
      return `You have recorded ${formatMoney(monthlyIncome)} income this month and ${formatMoney(monthlySpending)} expenses, leaving a recorded cash flow of ${netCashFlow < 0 ? "−" : ""}${formatMoney(Math.abs(netCashFlow))}.`;
    }

    if (/monthly|per month|each month|दर महिना|महिन्याला|महिन्याचा/.test(text)) {
      if (netCashFlow > 0) {
        return `Your recorded income exceeds expenses by ${formatMoney(netCashFlow)} so far this month. This is not a guaranteed monthly saving amount; check upcoming bills and your spending before setting a savings plan.`;
      }
      return `Your recorded cash flow this month is ${netCashFlow < 0 ? "−" : ""}${formatMoney(Math.abs(netCashFlow))}. Review upcoming bills and expenses before deciding how much to save.`;
    }

    if (/summary|overview|total|balance|किती|सारांश|एकूण|शिल्लक/.test(text)) {
      return `This month: income ${formatMoney(monthlyIncome)}, expenses ${formatMoney(monthlySpending)}, and recorded cash flow ${netCashFlow < 0 ? "−" : ""}${formatMoney(Math.abs(netCashFlow))}. There are ${unpaidBills.length} unpaid bills due by month-end (${formatMoney(unpaidBillsTotal)} total).`;
    }

    return "I can summarize income and expenses, compare months, review budgets or unpaid bills, estimate month-end balance, or check a savings goal. Try one of the suggested questions.";
  };

  const askMoneyAssistant = (question) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    setAssistantMessages((messages) => [
      ...messages,
      { id: assistantMessageId.current++, role: "user", text: trimmedQuestion },
      {
        id: assistantMessageId.current++,
        role: "assistant",
        text: getAssistantReply(trimmedQuestion),
      },
    ]);
    setAssistantQuestion("");
  };

  const handleAssistantSubmit = (event) => {
    event.preventDefault();
    askMoneyAssistant(assistantQuestion);
  };

  const suggestions = [];
  if (monthlyIncome === 0 && monthlySpending === 0) {
    suggestions.push({
      tone: "neutral",
      title: "Start with complete entries",
      detail: "Add this month's income and expenses to get money-management suggestions based on your actual records.",
      actions: [
        { to: "/income", label: "Add income" },
        { to: "/expense", label: "Add expense" },
      ],
    });
  } else {
    if (monthlyIncome === 0) {
      suggestions.push({
        tone: "caution",
        title: "Income is not recorded for this month",
        detail: "The balance below only compares recorded entries. Add your income before using it as a full-month spending plan.",
        actions: [{ to: "/income", label: "Add income" }],
      });
    } else if (netCashFlow < 0) {
      suggestions.push({
        tone: "caution",
        title: "Recorded spending is above recorded income",
        detail: `You have spent ${formatMoney(Math.abs(netCashFlow))} more than the income recorded for ${monthLabel}. Review flexible categories and upcoming bills.`,
        actions: [{ to: "/expense", label: "Review expenses" }],
      });
    } else if (monthlySpending === 0) {
      suggestions.push({
        tone: "positive",
        title: "No expenses recorded this month",
        detail: "Your current balance reflects recorded entries only. Add expenses as they happen to keep the picture accurate.",
        actions: [{ to: "/expense", label: "Add expense" }],
      });
    } else if (savingsRate < 20) {
      suggestions.push({
        tone: "neutral",
        title: "Build a little more room for savings",
        detail: `About ${savingsRate}% of recorded income remains. Review your largest flexible costs and choose a realistic amount to set aside.`,
        actions: [{ to: "/savings-goals", label: "Review savings goals" }],
      });
    } else {
      suggestions.push({
        tone: "positive",
        title: "Your recorded cash flow is positive",
        detail: `You have kept ${savingsRate}% of recorded income so far. Consider setting aside part of the remaining ${formatMoney(netCashFlow)} for your goals or emergency savings.`,
        actions: [{ to: "/savings-goals", label: "Plan savings" }],
      });
    }

    if (overBudget.length > 0) {
      suggestions.push({
        tone: "caution",
        title: `${overBudget.length} ${overBudget.length === 1 ? "category is" : "categories are"} over budget`,
        detail: overBudget.slice(0, 3).map((budget) => (
          `${budget.category} is over by ${formatMoney(budget.spent - budget.limit)}`
        )).join(" · "),
        actions: [{ to: "/budget", label: "Review budgets" }],
      });
    } else if (nearBudget.length > 0) {
      suggestions.push({
        tone: "neutral",
        title: "A few category limits are getting close",
        detail: nearBudget.slice(0, 3).map((budget) => (
          `${budget.category}: ${budget.percent}% used`
        )).join(" · "),
        actions: [{ to: "/budget", label: "Check budgets" }],
      });
    }

    if (topCategory && topCategoryShare >= 35) {
      suggestions.push({
        tone: "neutral",
        title: `${topCategory.name} is your largest spending category`,
        detail: `It accounts for ${topCategoryShare}% of this month's recorded expenses. Check whether this spending matches your priorities and budget.`,
        actions: [{ to: "/expense", label: "Review expenses" }],
      });
    }

    if (budgets.length === 0) {
      suggestions.push({
        tone: "neutral",
        title: "Set category budgets for clearer limits",
        detail: "A category budget can help you spot overspending earlier. Start with the categories where you spend the most.",
        actions: [{ to: "/budget", label: "Set a budget" }],
      });
    }
  }

  if (unpaidBillsTotal > 0) {
    suggestions.push({
      tone: balanceAfterBills < 0 ? "caution" : "neutral",
      title: `${formatMoney(unpaidBillsTotal)} in unpaid bills due this month`,
      detail: balanceAfterBills < 0
        ? `Your recorded balance may not cover these bills. Review their due dates and your spending plan.`
        : `${formatMoney(balanceAfterBills)} remains from your recorded balance after setting aside these bills.`,
      actions: [{ to: "/bills", label: "Review bills & EMI" }],
    });
  }

  if (activeGoals.length > 0) {
    suggestions.push({
      tone: "neutral",
      title: `${activeGoals.length} savings ${activeGoals.length === 1 ? "goal is" : "goals are"} in progress`,
      detail: `${formatMoney(totalGoalRemaining)} remains across your active goals.`,
      actions: [{ to: "/savings-goals", label: "Manage savings goals" }],
    });
  } else if (savingsGoals.length === 0) {
    suggestions.push({
      tone: "neutral",
      title: "Give your savings a goal",
      detail: "Set a target and track your progress toward it.",
      actions: [{ to: "/savings-goals", label: "Create a savings goal" }],
    });
  }

  return (
    <Layout>
      <main className="money-management">
        <header className="money-management-heading">
          <div>
            <span className="money-management-kicker">MAKE YOUR MONEY WORK</span>
            <h1>Money <span>Management</span></h1>
            <p>A practical overview based on your income, expenses and budgets.</p>
          </div>
          <span className="money-management-month">{monthLabel}</span>
        </header>

        <section className="money-management-summary" aria-label="Monthly money overview">
          <article className="money-management-metric">
            <span className="money-management-metric-icon income"><FaArrowDown /></span>
            <div><span>Income recorded</span><strong>{formatMoney(monthlyIncome)}</strong></div>
          </article>
          <article className="money-management-metric">
            <span className="money-management-metric-icon expense"><FaArrowUp /></span>
            <div><span>Expenses recorded</span><strong>{formatMoney(monthlySpending)}</strong></div>
          </article>
          <article className="money-management-metric">
            <span className={`money-management-metric-icon ${netCashFlow < 0 ? "expense" : "balance"}`}>
              <FaBalanceScale />
            </span>
            <div>
              <span>{netCashFlow < 0 ? "Spent beyond income" : "Remaining cash flow"}</span>
              <strong className={netCashFlow < 0 ? "negative" : ""}>
                {netCashFlow < 0 ? "−" : ""}{formatMoney(Math.abs(netCashFlow))}
              </strong>
            </div>
          </article>
          <article className="money-management-metric">
            <span className="money-management-metric-icon savings"><FaPiggyBank /></span>
            <div>
              <span>{budgetUsage === null ? "Savings rate" : "Budget used"}</span>
              <strong>
                {budgetUsage === null
                  ? savingsRate === null ? "—" : `${savingsRate}%`
                  : `${budgetUsage}%`}
              </strong>
              <small>
                {budgetUsage === null
                  ? "Based on recorded income"
                  : `${formatMoney(monthlySpending)} of ${formatMoney(totalBudget)}`}
              </small>
            </div>
          </article>
          <article className="money-management-metric">
            <span className="money-management-metric-icon bills"><FaCreditCard /></span>
            <div>
              <span>Balance after bills</span>
              <strong className={balanceAfterBills < 0 ? "negative" : ""}>
                {balanceAfterBills < 0 ? "−" : ""}{formatMoney(Math.abs(balanceAfterBills))}
              </strong>
              <small>
                Recorded balance minus {unpaidBills.length} unpaid bill{unpaidBills.length === 1 ? "" : "s"} due by month-end
              </small>
            </div>
          </article>
        </section>

        <section className="money-management-planning-grid" aria-label="Spending comparison and forecast">
          <article className="money-management-panel money-management-comparison">
            <header className="money-management-section-heading">
              <span className="money-management-section-icon"><FaChartLine /></span>
              <div>
                <h2>Month-over-month</h2>
                <p>This month so far compared with last month's full total.</p>
              </div>
            </header>
            <div className="money-management-comparison-list">
              <div className={`money-management-comparison-item ${expenseChange > 0 ? "caution" : "positive"}`}>
                <span>Expenses</span>
                <strong>{formatMoney(monthlySpending)}</strong>
                <small>Last month: {formatMoney(previousMonthSpending)}</small>
                <em>
                  {expenseChange > 0 ? "+" : expenseChange < 0 ? "−" : ""}
                  {formatMoney(Math.abs(expenseChange))} · {changeDescription(monthlySpending, previousMonthSpending)}
                </em>
              </div>
              <div className={`money-management-comparison-item ${incomeChange >= 0 ? "positive" : "caution"}`}>
                <span>Income</span>
                <strong>{formatMoney(monthlyIncome)}</strong>
                <small>Last month: {formatMoney(previousMonthIncome)}</small>
                <em>
                  {incomeChange > 0 ? "+" : incomeChange < 0 ? "−" : ""}
                  {formatMoney(Math.abs(incomeChange))} · {changeDescription(monthlyIncome, previousMonthIncome)}
                </em>
              </div>
            </div>
          </article>

          <article className="money-management-panel money-management-forecast">
            <header className="money-management-section-heading">
              <span className="money-management-section-icon"><FaCalendarCheck /></span>
              <div>
                <h2>Month-end estimate</h2>
                <p>Based on the average daily pace recorded so far.</p>
              </div>
            </header>
            {projectedMonthEndBalance === null ? (
              <p className="money-management-empty">
                Add income or expenses this month to see an estimate.
              </p>
            ) : (
              <div className="money-management-forecast-values">
                <div><span>Income recorded so far</span><strong>{formatMoney(monthlyIncome)}</strong></div>
                <div><span>Estimated expenses</span><strong>{formatMoney(projectedExpenses)}</strong></div>
                <div className={projectedMonthEndBalance < 0 ? "negative" : "positive"}>
                  <span>Estimated month-end balance</span>
                  <strong>
                    {projectedMonthEndBalance < 0 ? "−" : ""}
                    {formatMoney(Math.abs(projectedMonthEndBalance))}
                  </strong>
                </div>
              </div>
            )}
            <small className="money-management-forecast-note">
              Estimate only—not a guarantee. Expenses use the current daily average; income is what you have recorded so far.
            </small>
          </article>
        </section>

        <section className="money-management-advice" aria-labelledby="money-advice-title">
          <header className="money-management-section-heading">
            <span className="money-management-section-icon"><FaLightbulb /></span>
            <div>
              <h2 id="money-advice-title">Your money check-in</h2>
              <p>Suggestions based on the entries you recorded for {monthLabel}.</p>
            </div>
          </header>
          <div className="money-management-suggestions">
            {suggestions.map((suggestion) => (
              <article className={`money-management-suggestion ${suggestion.tone}`} key={suggestion.title}>
                <span className="money-management-suggestion-icon">
                  {suggestion.tone === "caution"
                    ? <FaExclamationTriangle aria-hidden="true" />
                    : <FaCheckCircle aria-hidden="true" />}
                </span>
                <div>
                  <h3>{suggestion.title}</h3>
                  <p>{suggestion.detail}</p>
                  {suggestion.actions?.map((action) => (
                    <Link className="money-management-action" to={action.to} key={action.to}>
                      {action.label} <FaArrowRight aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <p className="money-management-disclaimer">
            These suggestions use only the entries saved in this browser and are for planning purposes, not professional financial advice.
          </p>
        </section>

        <div className="money-management-details">
          <section className="money-management-panel">
            <header className="money-management-section-heading">
              <div>
                <h2>Spending by category</h2>
                <p>Where your recorded expenses are going.</p>
              </div>
            </header>
            {categorySpending.length > 0 ? (
              <ul className="money-management-category-list">
                {categorySpending.map((item) => {
                  const share = monthlySpending > 0
                    ? Math.round((item.amount / monthlySpending) * 100)
                    : 0;
                  return (
                    <li key={item.name}>
                      <div className="money-management-category-label">
                        <strong>{item.name}</strong>
                        <span>{formatMoney(item.amount)} · {share}%</span>
                      </div>
                      <div className="money-management-progress" aria-label={`${item.name}: ${share}% of spending`}>
                        <span style={{ width: `${share}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="money-management-empty">Your category breakdown will appear after you add expenses this month.</p>
            )}
          </section>

          <section className="money-management-panel">
            <header className="money-management-section-heading">
              <div>
                <h2>Budget check</h2>
                <p>Current-month spending compared with your category limits.</p>
              </div>
            </header>
            {budgetReviews.length > 0 ? (
              <ul className="money-management-budget-list">
                {budgetReviews.map((budget) => {
                  const isOver = budget.spent > budget.limit;
                  return (
                    <li className={isOver ? "over" : ""} key={budget.category}>
                      <div>
                        <strong>{budget.category}</strong>
                        <span>{formatMoney(budget.spent)} of {formatMoney(budget.limit)}</span>
                      </div>
                      <span className="money-management-budget-status">
                        {isOver
                          ? `${formatMoney(budget.spent - budget.limit)} over`
                          : `${Math.max(0, 100 - budget.percent)}% left`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="money-management-empty">No category budgets yet. Set limits on the Budget Management page to compare your spending.</p>
            )}
          </section>
        </div>

        <section className="money-management-panel money-management-goals" aria-labelledby="money-goals-title">
          <header className="money-management-section-heading">
            <span className="money-management-section-icon"><FaPiggyBank /></span>
            <div>
              <h2 id="money-goals-title">Savings goals</h2>
              <p>
                {savingsGoals.length
                  ? `${formatMoney(totalGoalSaved)} saved of ${formatMoney(totalGoalTarget)} · ${overallGoalProgress}% overall progress`
                  : "Set a savings goal and track progress here."}
              </p>
            </div>
            <Link className="money-management-section-link" to="/savings-goals">
              {savingsGoals.length ? "Manage goals" : "Create a goal"}
              <FaArrowRight aria-hidden="true" />
            </Link>
          </header>
          {savingsGoals.length > 0 ? (
            <>
              <div
                className="money-management-goal-overall"
                role="progressbar"
                aria-label="Overall savings goal progress"
                aria-valuenow={overallGoalProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <span style={{ width: `${overallGoalProgress}%` }} />
              </div>
              <ul className="money-management-goal-list">
                {savingsGoals.slice(0, 5).map((goal) => {
                  const target = Number(goal.target || 0);
                  const saved = Number(goal.saved || 0);
                  const progress = target > 0
                    ? Math.min(100, Math.round((saved / target) * 100))
                    : 0;
                  return (
                    <li key={goal.id}>
                      <div className="money-management-goal-label">
                        <strong>{goal.name}</strong>
                        <span>
                          {formatMoney(saved)} of {formatMoney(target)}
                          {" · "}{formatMoney(Math.max(0, target - saved))} left
                        </span>
                      </div>
                      <div
                        className="money-management-progress"
                        role="progressbar"
                        aria-label={`${goal.name}: ${progress}% complete`}
                        aria-valuenow={progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        <span style={{ width: `${progress}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              {totalGoalRemaining > 0 && (
                <p className="money-management-goal-remaining">
                  {formatMoney(totalGoalRemaining)} remaining across active goals.
                </p>
              )}
            </>
          ) : (
            <p className="money-management-empty">No savings goals yet. Create one to start tracking your progress.</p>
          )}
        </section>

        <aside className="money-assistant">
          {isAssistantOpen && (
            <section className="money-assistant-panel" aria-label="Money Management Assistant chat">
              <header className="money-assistant-header">
                <span className="money-assistant-avatar"><FaRobot aria-hidden="true" /></span>
                <div>
                  <strong>Money Assistant</strong>
                  <small>Insights from your finance records</small>
                </div>
                <button
                  type="button"
                  className="money-assistant-close"
                  onClick={() => setIsAssistantOpen(false)}
                  aria-label="Close Money Assistant"
                >
                  <FaTimes aria-hidden="true" />
                </button>
              </header>
              <div className="money-assistant-messages" ref={assistantMessagesRef} aria-live="polite">
                {assistantMessages.map((message) => (
                  <p
                    className={`money-assistant-message ${message.role}`}
                    key={message.id}
                  >
                    {message.text}
                  </p>
                ))}
              </div>
              <div className="money-assistant-prompts" aria-label="Suggested questions">
                <button type="button" onClick={() => askMoneyAssistant("Show my money summary")}>
                  Money summary
                </button>
                <button type="button" onClick={() => askMoneyAssistant("Which bills are unpaid?")}>
                  Unpaid bills
                </button>
                <button type="button" onClick={() => askMoneyAssistant("Check my budgets")}>
                  Budget check
                </button>
                <button type="button" onClick={() => askMoneyAssistant("Show my savings goals")}>
                  Savings goals
                </button>
              </div>
              <form className="money-assistant-form" onSubmit={handleAssistantSubmit}>
                <label className="visually-hidden" htmlFor="money-assistant-question">
                  Ask about your money management
                </label>
                <input
                  id="money-assistant-question"
                  ref={assistantInputRef}
                  type="text"
                  value={assistantQuestion}
                  onChange={(event) => setAssistantQuestion(event.target.value)}
                  placeholder="Ask about your money..."
                  maxLength={240}
                />
                <button type="submit" disabled={!assistantQuestion.trim()} aria-label="Send message">
                  <FaPaperPlane aria-hidden="true" />
                </button>
              </form>
              <small className="money-assistant-privacy">
                Uses your finance data on this device. No money is moved.
              </small>
            </section>
          )}
          <button
            type="button"
            className="money-assistant-launcher"
            onClick={() => setIsAssistantOpen((open) => !open)}
            aria-expanded={isAssistantOpen}
            aria-label={isAssistantOpen ? "Close Money Assistant" : "Open Money Assistant"}
          >
            {isAssistantOpen ? <FaTimes aria-hidden="true" /> : <FaComments aria-hidden="true" />}
            <span>{isAssistantOpen ? "Close" : "Money Assistant"}</span>
          </button>
        </aside>
      </main>
    </Layout>
  );
}

export default MoneyManagement;
