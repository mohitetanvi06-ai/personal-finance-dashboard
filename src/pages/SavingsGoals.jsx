import { useContext, useState } from "react";
import {
  FaCalendarAlt,
  FaCar,
  FaGraduationCap,
  FaHome,
  FaLaptop,
  FaPlane,
  FaPiggyBank,
  FaPlus,
  FaShieldAlt,
  FaTrash,
} from "react-icons/fa";

import Layout from "../components/Layout";
import { FinanceContext } from "../context/FinanceDataContext";
import "./SavingsGoals.css";

const formatMoney = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function getGoalIcon(name) {
  const value = name.toLowerCase();
  if (/home|house|flat|rent/.test(value)) return FaHome;
  if (/car|vehicle|bike|scooter/.test(value)) return FaCar;
  if (/travel|trip|vacation|holiday/.test(value)) return FaPlane;
  if (/study|education|college|course/.test(value)) return FaGraduationCap;
  if (/laptop|computer|phone|mobile|gadget/.test(value)) return FaLaptop;
  if (/emergency|medical|health|safety/.test(value)) return FaShieldAlt;
  return FaPiggyBank;
}

function getMonthsRemaining(targetDate) {
  if (!targetDate) return null;
  const target = new Date(`${targetDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (target <= today) return 0;
  const months = (target.getFullYear() - today.getFullYear()) * 12 +
    target.getMonth() - today.getMonth();
  return Math.max(1, months);
}

function parseFinanceDate(value) {
  if (!value) return null;
  const text = String(value).trim();
  const isoDate = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(text);
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
    const day = Number(localDate[1]);
    const month = Number(localDate[2]);
    const yearValue = Number(localDate[3]);
    const year = yearValue < 100 ? 2000 + yearValue : yearValue;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1
      ? date
      : null;
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatTargetDate(targetDate) {
  if (!targetDate) return "No target date set";
  const date = new Date(`${targetDate}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? "No target date set"
    : `Target: ${date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getCalendarDays(month) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cellCount = Math.ceil((leadingDays + daysInMonth) / 7) * 7;

  return Array.from(
    { length: cellCount },
    (_, index) => new Date(month.getFullYear(), month.getMonth(), index - leadingDays + 1)
  );
}

function SavingsGoals() {
  const {
    income = [],
    expense = [],
    savingsGoals: goals = [],
    setSavingsGoals,
    savingsDeposits = [],
    setSavingsDeposits,
    calendarNotes = {},
    setCalendarNotes,
  } = useContext(FinanceContext);
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isAddingSavings, setIsAddingSavings] = useState(false);
  const [savingAmount, setSavingAmount] = useState("");
  const [allocateToGoal, setAllocateToGoal] = useState(null);
  const [allocationAmount, setAllocationAmount] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => formatDateKey(new Date()));
  const [calendarNoteDraft, setCalendarNoteDraft] = useState(
    () => calendarNotes[formatDateKey(new Date())] || ""
  );
  const [calendarNoteNotice, setCalendarNoteNotice] = useState("");

  const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.target || 0), 0);
  const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.saved || 0), 0);
  const completedGoals = goals.filter(
    (goal) => Number(goal.target) > 0 && Number(goal.saved) >= Number(goal.target)
  ).length;
  const overallProgress = totalTarget > 0
    ? Math.min(100, Math.round((totalSaved / totalTarget) * 100))
    : 0;
  const availableSavings = savingsDeposits.reduce(
    (sum, deposit) => sum + Math.max(
      0,
      Number(deposit.remaining ?? deposit.amount) || 0
    ),
    0
  );
  const today = new Date();
  const currentMonthIncome = income.filter((item) => {
    const date = parseFinanceDate(item.date);
    return date && date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth();
  });
  const currentMonthExpenses = expense.filter((item) => {
    const date = parseFinanceDate(item.date);
    return date && date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth();
  });
  const recordedMonthlyNet = currentMonthIncome.length > 0 && currentMonthExpenses.length > 0
    ? currentMonthIncome.reduce((sum, item) => sum + Number(item.amount || 0), 0) -
      currentMonthExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    : null;
  const totalMonthlyGoalPlan = goals.reduce((sum, goal) => {
    const months = getMonthsRemaining(goal.targetDate);
    const remaining = Math.max(0, Number(goal.target || 0) - Number(goal.saved || 0));
    return months && remaining > 0 ? sum + remaining / months : sum;
  }, 0);
  const calendarGoalsByDate = goals.reduce((groupedGoals, goal) => {
    const date = parseFinanceDate(goal.targetDate);
    if (!date) return groupedGoals;

    const dateKey = formatDateKey(date);
    groupedGoals[dateKey] = [...(groupedGoals[dateKey] || []), goal];
    return groupedGoals;
  }, {});
  const calendarDays = getCalendarDays(calendarMonth);
  const selectedDate = parseFinanceDate(selectedCalendarDate);
  const selectedDateGoals = calendarGoalsByDate[selectedCalendarDate] || [];

  const selectCalendarDate = (dateKey) => {
    setSelectedCalendarDate(dateKey);
    setCalendarNoteDraft(calendarNotes[dateKey] || "");
    setCalendarNoteNotice("");
  };

  const changeCalendarMonth = (offset) => {
    const nextMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + offset,
      1
    );
    const nextDateKey = formatDateKey(nextMonth);
    setCalendarMonth(nextMonth);
    selectCalendarDate(nextDateKey);
  };

  const handleSaveCalendarNote = (event) => {
    event.preventDefault();
    const note = calendarNoteDraft.trim();
    if (!note) {
      setCalendarNoteNotice("Write a note before saving.");
      return;
    }

    setCalendarNotes((current) => ({ ...current, [selectedCalendarDate]: note }));
    setCalendarNoteDraft(note);
    setCalendarNoteNotice("Note saved.");
  };

  const handleDeleteCalendarNote = () => {
    setCalendarNotes((current) => {
      const updatedNotes = { ...current };
      delete updatedNotes[selectedCalendarDate];
      return updatedNotes;
    });
    setCalendarNoteDraft("");
    setCalendarNoteNotice("Note deleted.");
  };

  const handleAddGoal = (event) => {
    event.preventDefault();
    const target = Number(targetAmount);
    const saved = Number(savedAmount);

    if (!goalName.trim() || !Number.isFinite(target) || target <= 0 ||
      !Number.isFinite(saved) || saved < 0 || saved > target) {
      window.alert("Enter a goal name and valid target and saved amounts.");
      return;
    }

    setSavingsGoals((previous) => [
      ...previous,
      {
        id: Date.now(),
        name: goalName.trim(),
        target,
        saved,
        targetDate,
        contributions: saved > 0 ? [{ amount: saved, date: new Date().toISOString() }] : [],
      },
    ]);
    setGoalName("");
    setTargetAmount("");
    setSavedAmount("");
    setTargetDate("");
  };

  const handleAddSavings = (event) => {
    event.preventDefault();
    const amount = Number(savingAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert("Enter a savings amount greater than zero.");
      return;
    }

    setSavingsDeposits((items) => [
      ...items,
      {
        id: Date.now(),
        amount,
        remaining: amount,
        date: new Date().toISOString(),
      },
    ]);
    setSavingAmount("");
    setIsAddingSavings(false);
  };

  const handleAllocateSavings = (event, goal) => {
    event.preventDefault();
    const amount = Number(allocationAmount);
    const available = Math.min(availableSavings, Math.max(0, Number(goal.target) - Number(goal.saved)));
    if (!Number.isFinite(amount) || amount <= 0 || amount > available) {
      window.alert(`Enter an amount up to ${formatMoney(available)}.`);
      return;
    }

    let remainingToAllocate = amount;
    setSavingsDeposits((items) => items.map((deposit) => {
      const remaining = Math.max(0, Number(deposit.remaining ?? deposit.amount) || 0);
      const allocated = Math.min(remaining, remainingToAllocate);
      remainingToAllocate -= allocated;
      return { ...deposit, remaining: remaining - allocated };
    }));
    setSavingsGoals((items) => items.map((item) => item.id === goal.id
      ? {
        ...item,
        saved: Number(item.saved || 0) + amount,
        contributions: [
          ...(Array.isArray(item.contributions) ? item.contributions : []),
          {
            amount,
            date: new Date().toISOString(),
            source: "savings-pool",
          },
        ],
      }
      : item
    ));
    setAllocationAmount("");
    setAllocateToGoal(null);
  };

  const deleteGoal = (goalId) => {
    const goal = goals.find((item) => item.id === goalId);
    const refundableAmount = Array.isArray(goal?.contributions)
      ? goal.contributions.reduce(
        (sum, contribution) => contribution.source === "savings-pool"
          ? sum + Number(contribution.amount || 0)
          : sum,
        0
      )
      : 0;
    if (refundableAmount > 0) {
      setSavingsDeposits((items) => [
        ...items,
        {
          id: Date.now(),
          amount: refundableAmount,
          remaining: refundableAmount,
          date: new Date().toISOString(),
          countsTowardMonthlyTarget: false,
        },
      ]);
    }
    setSavingsGoals((items) => items.filter((goal) => goal.id !== goalId));
    if (allocateToGoal === goalId) {
      setAllocateToGoal(null);
      setAllocationAmount("");
    }
  };

  return (
    <Layout>
      <main className="savings-management">
        <header className="savings-page-heading">
          <div>
            <span className="savings-page-kicker">MAKE IT HAPPEN</span>
            <h1>Savings <span>Goals</span></h1>
            <p>Little by little, your plans become milestones.</p>
          </div>
          <div className="savings-page-heading-actions">
            <button
              className="savings-create-link savings-add-savings-button"
              type="button"
              onClick={() => setIsAddingSavings((current) => !current)}
              aria-expanded={isAddingSavings}
              aria-controls="add-savings-form"
            >
              <FaPlus aria-hidden="true" />
              Add savings
            </button>
            <a className="savings-create-link" href="#create-savings-goal">
              <FaPlus aria-hidden="true" />
              Create a goal
            </a>
          </div>
        </header>

        {isAddingSavings && (
          <form
            className="savings-add-panel"
            id="add-savings-form"
            onSubmit={handleAddSavings}
          >
            <label className="savings-field">
              <span>Amount to add to savings</span>
              <div className="savings-amount-input">
                <span aria-hidden="true">₹</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={savingAmount}
                  onChange={(event) => setSavingAmount(event.target.value)}
                  placeholder="e.g. 500"
                  autoFocus
                  required
                />
              </div>
            </label>
            <p>This amount stays in your available savings until you allocate it to a goal.</p>
            <button className="savings-create-button" type="submit">
              Add to savings
            </button>
          </form>
        )}

        <section className="savings-summary-grid" aria-label="Savings overview">
          <article className="savings-summary-card savings-summary-total">
            <span className="savings-summary-icon"><FaPiggyBank /></span>
            <div>
              <span>Total saved</span>
              <strong>{formatMoney(totalSaved)}</strong>
              <small>Across {goals.length} {goals.length === 1 ? "goal" : "goals"}</small>
            </div>
          </article>
          <article className="savings-summary-card savings-summary-target">
            <span className="savings-summary-icon"><FaCalendarAlt /></span>
            <div>
              <span>Total target</span>
              <strong>{formatMoney(totalTarget)}</strong>
              <small>{overallProgress}% of your combined target</small>
            </div>
          </article>
          <article className="savings-summary-card savings-summary-available">
            <span className="savings-summary-icon"><FaPiggyBank /></span>
            <div>
              <span>Available to allocate</span>
              <strong>{formatMoney(availableSavings)}</strong>
              <small>Saved, but not assigned to a goal</small>
            </div>
          </article>
          <article className="savings-summary-card savings-summary-complete">
            <span className="savings-summary-icon"><FaShieldAlt /></span>
            <div>
              <span>Goals reached</span>
              <strong>{completedGoals}<small> / {goals.length}</small></strong>
              <small>Every milestone counts</small>
            </div>
          </article>
        </section>

        {goals.length > 0 && (
          <section className={`savings-affordability-note ${
            recordedMonthlyNet !== null &&
            totalMonthlyGoalPlan > Math.max(0, recordedMonthlyNet)
              ? "caution"
              : ""
          }`} aria-live="polite">
            <span className="savings-affordability-icon"><FaShieldAlt aria-hidden="true" /></span>
            {totalMonthlyGoalPlan === 0 ? (
              <div>
                <strong>Set a future date to see a monthly goal plan</strong>
                <p>Completed goals need no further contributions; active goals without a future date have no monthly estimate.</p>
              </div>
            ) : recordedMonthlyNet === null ? (
              <div>
                <strong>Goal amounts are deadline-based estimates</strong>
                <p>Add income and expenses for this month to compare your goal plan with recorded cash flow.</p>
              </div>
            ) : (
              <div>
                <strong>
                  Goals need about {formatMoney(totalMonthlyGoalPlan)} per month ·
                  {" "}recorded net so far: {recordedMonthlyNet < 0 ? "−" : ""}
                  {formatMoney(Math.abs(recordedMonthlyNet))}
                </strong>
                <p>
                  This is an early check from this month's entries, not a full-month forecast.
                  {totalMonthlyGoalPlan > Math.max(0, recordedMonthlyNet)
                    ? " Consider extending target dates or lowering goals if the planned amount is not manageable."
                    : " Review again as you record more income and expenses."}
                </p>
              </div>
            )}
          </section>
        )}

        <section className="savings-calendar-panel" aria-labelledby="savings-calendar-title">
          <header className="savings-calendar-heading">
            <div>
              <span className="savings-section-kicker">PLAN AHEAD</span>
              <h2 id="savings-calendar-title">Goal calendar</h2>
              <p>See when your savings milestones are coming up.</p>
            </div>
            <div className="savings-calendar-navigation" aria-label="Calendar navigation">
              <button
                type="button"
                onClick={() => changeCalendarMonth(-1)}
                aria-label="Previous month"
              >
                ‹
              </button>
              <strong aria-live="polite">
                {calendarMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </strong>
              <button
                type="button"
                onClick={() => changeCalendarMonth(1)}
                aria-label="Next month"
              >
                ›
              </button>
            </div>
          </header>
          <div className="savings-calendar-content">
            <div className="savings-calendar-grid" role="group" aria-label="Goal deadlines calendar">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <span className="savings-calendar-weekday" key={day}>
                  {day}
                </span>
              ))}
              {calendarDays.map((day) => {
                const dateKey = formatDateKey(day);
                const dayGoals = calendarGoalsByDate[dateKey] || [];
                const hasNote = Boolean(calendarNotes[dateKey]);
                const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
                const isSelected = dateKey === selectedCalendarDate;
                const isToday = dateKey === formatDateKey(new Date());
                const accessibleDate = day.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });

                return (
                  <button
                    className={[
                      "savings-calendar-day",
                      isCurrentMonth ? "" : "outside-month",
                      isSelected ? "selected" : "",
                      isToday ? "today" : "",
                      dayGoals.length ? "has-goals" : "",
                      hasNote ? "has-note" : "",
                    ].filter(Boolean).join(" ")}
                    type="button"
                    key={dateKey}
                    onClick={() => selectCalendarDate(dateKey)}
                    disabled={!isCurrentMonth}
                    aria-label={`${accessibleDate}${dayGoals.length
                      ? `, ${dayGoals.length} ${dayGoals.length === 1 ? "goal deadline" : "goal deadlines"}: ${dayGoals.map((goal) => goal.name).join(", ")}`
                      : ""}${hasNote ? ", has a saved note" : ""}`}
                    aria-pressed={isSelected}
                  >
                    <span>{day.getDate()}</span>
                    {dayGoals.length > 0 && (
                      <span className="savings-calendar-day-count" aria-hidden="true">
                        {dayGoals.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <aside className="savings-calendar-details" aria-live="polite">
              <span className="savings-calendar-details-label">
                {selectedDate?.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
              {selectedDateGoals.length > 0 ? (
                <ul>
                  {selectedDateGoals.map((goal) => (
                    <li key={goal.id}>
                      <span aria-hidden="true" />
                      <div>
                        <strong>{goal.name}</strong>
                        <small>Target: {formatMoney(goal.target)}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  {goals.some((goal) => goal.targetDate)
                    ? "No goal deadlines on this date."
                    : "Add a target date to a savings goal to see it here."}
                </p>
              )}
              <form className="savings-calendar-note-form" onSubmit={handleSaveCalendarNote}>
                <label htmlFor="savings-calendar-note">Note for this day</label>
                <textarea
                  id="savings-calendar-note"
                  value={calendarNoteDraft}
                  onChange={(event) => {
                    setCalendarNoteDraft(event.target.value);
                    setCalendarNoteNotice("");
                  }}
                  placeholder="Add a reminder or note..."
                  maxLength={500}
                  rows={3}
                />
                <div className="savings-calendar-note-actions">
                  <button type="submit">Save note</button>
                  {calendarNotes[selectedCalendarDate] && (
                    <button type="button" onClick={handleDeleteCalendarNote}>
                      Delete
                    </button>
                  )}
                </div>
                {calendarNoteNotice && (
                  <small className="savings-calendar-note-notice" role="status">
                    {calendarNoteNotice}
                  </small>
                )}
              </form>
            </aside>
          </div>
        </section>

        <section className="savings-goals-panel">
          <header className="savings-goals-panel-heading">
            <div>
              <span className="savings-section-kicker">YOUR MILESTONES</span>
              <h2>Goals in progress</h2>
              <p>Keep going—you’re building something meaningful.</p>
            </div>
            {goals.length > 0 && (
              <div className="savings-overall-progress">
                <strong>{overallProgress}%</strong>
                <span>overall saved</span>
              </div>
            )}
          </header>

          {goals.length === 0 ? (
            <div className="savings-empty-state">
              <div className="savings-empty-art">
                <span className="savings-empty-orbit orbit-one" />
                <span className="savings-empty-orbit orbit-two" />
                <span className="savings-empty-coin"><FaPiggyBank /></span>
                <span className="savings-empty-star star-one">✦</span>
                <span className="savings-empty-star star-two">✧</span>
              </div>
              <h3>Your next big thing starts here</h3>
              <p>Create a savings goal, add your first contribution, and watch your progress grow.</p>
              <a href="#create-savings-goal" className="savings-empty-link">
                Create your first goal <span aria-hidden="true">→</span>
              </a>
            </div>
          ) : (
            <div className="savings-goal-grid">
              {goals.map((goal, index) => {
                const target = Number(goal.target || 0);
                const saved = Number(goal.saved || 0);
                const remaining = Math.max(0, target - saved);
                const progress = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
                const monthsRemaining = getMonthsRemaining(goal.targetDate);
                const monthlySuggestion = monthsRemaining && remaining > 0
                  ? remaining / monthsRemaining
                  : null;
                const targetHasPassed = monthsRemaining === 0 && remaining > 0;
                const GoalIcon = getGoalIcon(goal.name);
                const contributionCount = Array.isArray(goal.contributions)
                  ? goal.contributions.length
                  : 0;

                return (
                  <article className={`savings-goal-card goal-tone-${(index % 4) + 1}`} key={goal.id}>
                    <header className="savings-goal-card-heading">
                      <span className="savings-goal-icon"><GoalIcon /></span>
                      <div className="savings-goal-title">
                        <h3>{goal.name}</h3>
                        <span>{formatTargetDate(goal.targetDate)}</span>
                      </div>
                      <div className="savings-goal-amount">
                        <strong>{formatMoney(saved)}</strong>
                        <span>of {formatMoney(target)}</span>
                      </div>
                    </header>

                    <div className="savings-progress-labels">
                      <span>{saved >= target ? "Goal reached!" : `${progress}% complete`}</span>
                      <span>{saved >= target ? "Amazing work 🎉" : `${formatMoney(remaining)} to go`}</span>
                    </div>
                    <div
                      className="savings-progress-track"
                      role="progressbar"
                      aria-label={`${goal.name} progress`}
                      aria-valuenow={progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <span style={{ width: `${progress}%` }} />
                    </div>

                    <footer className="savings-goal-card-footer">
                      <div className="savings-goal-activity">
                        <span>{contributionCount} {contributionCount === 1 ? "contribution" : "contributions"}</span>
                        {monthlySuggestion && (
                          <small>Suggested: {formatMoney(monthlySuggestion)} / month</small>
                        )}
                        {targetHasPassed && <small className="savings-overdue-note">Target date passed · review your plan</small>}
                      </div>
                      <div className="savings-goal-actions">
                        {allocateToGoal === goal.id ? (
                          <form
                            className="savings-contribution-form"
                            onSubmit={(event) => handleAllocateSavings(event, goal)}
                          >
                            <label className="visually-hidden" htmlFor={`allocation-${goal.id}`}>
                              Amount to allocate to {goal.name}
                            </label>
                            <span aria-hidden="true">₹</span>
                            <input
                              id={`allocation-${goal.id}`}
                              type="number"
                              min="0.01"
                              max={Math.min(availableSavings, remaining)}
                              step="0.01"
                              value={allocationAmount}
                              onChange={(event) => setAllocationAmount(event.target.value)}
                              placeholder="Amount"
                              autoFocus
                              required
                            />
                            <button type="submit">Add</button>
                            <button
                              type="button"
                              className="savings-cancel-contribution"
                              onClick={() => {
                                setAllocateToGoal(null);
                                setAllocationAmount("");
                              }}
                              aria-label="Cancel allocation"
                            >
                              ×
                            </button>
                          </form>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="savings-contribute-button"
                              onClick={() => setAllocateToGoal(goal.id)}
                              disabled={saved >= target || availableSavings <= 0}
                              title={availableSavings <= 0 ? "Add savings first" : ""}
                            >
                              <FaPlus aria-hidden="true" />
                              {saved >= target ? "Completed" : "Allocate"}
                            </button>
                            {availableSavings > 0 && saved < target && (
                              <small className="savings-allocation-available">
                                Available {formatMoney(availableSavings)}
                              </small>
                            )}
                          </>
                        )}
                        <button
                          type="button"
                          className="savings-delete-button"
                          onClick={() => deleteGoal(goal.id)}
                          aria-label={`Delete ${goal.name}`}
                          title="Delete goal"
                        >
                          <FaTrash aria-hidden="true" />
                        </button>
                      </div>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="savings-create-panel" id="create-savings-goal">
          <header className="savings-create-heading">
            <div className="savings-create-icon"><FaPlus /></div>
            <div>
              <span className="savings-section-kicker">START SOMETHING GREAT</span>
              <h2>Create a savings goal</h2>
              <p>Name your goal, set a target, and choose a date to aim for.</p>
            </div>
          </header>
          <form className="savings-create-form" onSubmit={handleAddGoal}>
            <label className="savings-field savings-field-name">
              <span>Goal name</span>
              <input
                type="text"
                value={goalName}
                onChange={(event) => setGoalName(event.target.value)}
                placeholder="e.g. Dream vacation"
                maxLength={70}
                required
              />
            </label>
            <label className="savings-field">
              <span>Target amount</span>
              <div className="savings-amount-input">
                <span aria-hidden="true">₹</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={targetAmount}
                  onChange={(event) => setTargetAmount(event.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </label>
            <label className="savings-field">
              <span>Already saved</span>
              <div className="savings-amount-input">
                <span aria-hidden="true">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={savedAmount}
                  onChange={(event) => setSavedAmount(event.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </label>
            <label className="savings-field">
              <span>Target date <small>Optional</small></span>
              <input
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
                min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10)}
              />
            </label>
            <button className="savings-create-button" type="submit">
              <FaPlus aria-hidden="true" />
              Create goal
            </button>
          </form>
        </section>

      </main>
    </Layout>
  );
}

export default SavingsGoals;
