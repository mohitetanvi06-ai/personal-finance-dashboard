import { useContext, useMemo, useRef, useState } from "react";
import {
  FaCalendarAlt,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaCreditCard,
  FaPlus,
  FaReceipt,
  FaTrash,
} from "react-icons/fa";

import Layout from "../components/Layout";
import { FinanceContext } from "../context/FinanceDataContext";
import "./Bills.css";

const BILL_TYPES = ["EMI", "Rent", "Utilities", "Insurance", "Credit card", "Other"];
const FREQUENCIES = [
  { value: "monthly", label: "Monthly", months: 1 },
  { value: "quarterly", label: "Every 3 months", months: 3 },
  { value: "yearly", label: "Yearly", months: 12 },
  { value: "once", label: "One-time", months: 0 },
];

function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function parseDate(value) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1]) &&
    date.getMonth() === Number(match[2]) - 1 &&
    date.getDate() === Number(match[3])
    ? date
    : null;
}

function formatMoney(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  const date = parseDate(value);
  return date
    ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "Date not set";
}

function advanceDueDate(value, months) {
  const due = parseDate(value);
  if (!due || months < 1) return value;
  const day = due.getDate();
  const nextMonth = new Date(due.getFullYear(), due.getMonth() + months, 1);
  const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
  nextMonth.setDate(Math.min(day, lastDay));
  return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-${String(nextMonth.getDate()).padStart(2, "0")}`;
}

function getBillStatus(bill, today) {
  if (bill.status === "completed") return "Completed";
  const dueDate = parseDate(bill.dueDate);
  if (!dueDate) return "No due date";
  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const daysUntilDue = Math.round((due - today) / 86_400_000);
  if (daysUntilDue < 0) return "Overdue";
  if (daysUntilDue <= 7) return "Due soon";
  return "Upcoming";
}

function getPaidInstallments(bill) {
  const paid = Number(bill.paidInstallments);
  if (Number.isInteger(paid) && paid >= 0) return paid;
  return Array.isArray(bill.payments) ? bill.payments.length : 0;
}

function getRemainingInstallments(bill) {
  const total = Number(bill.totalInstallments);
  if (!Number.isInteger(total) || total < 1) return null;
  return Math.max(0, total - getPaidInstallments(bill));
}

function Bills() {
  const {
    income = [],
    expense = [],
    setExpense,
    bills = [],
    setBills,
  } = useContext(FinanceContext);
  const [name, setName] = useState("");
  const [type, setType] = useState(BILL_TYPES[0]);
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(getToday);
  const [frequency, setFrequency] = useState("monthly");
  const [totalInstallments, setTotalInstallments] = useState("");
  const [notice, setNotice] = useState("");
  const [payingIds, setPayingIds] = useState([]);
  const [expandedEmiIds, setExpandedEmiIds] = useState([]);
  const paymentLocks = useRef(new Set());

  const saveBills = (updatedBills) => {
    setBills(updatedBills);
  };

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const availableBalance = income.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  ) - expense.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const billStatuses = bills.map((bill) => ({
    bill,
    status: getBillStatus(bill, today),
  }));
  const overdueCount = billStatuses.filter(({ status }) => status === "Overdue").length;
  const dueSoonBills = billStatuses.filter(({ status }) => status === "Due soon");
  const dueSoonTotal = dueSoonBills.reduce(
    (sum, { bill }) => sum + Number(bill.amount || 0),
    0
  );
  const monthlyCommitments = bills.reduce((sum, bill) => {
    if (bill.status === "completed") return sum;
    const recurrence = FREQUENCIES.find((item) => item.value === bill.frequency);
    return sum + (recurrence?.months
      ? Number(bill.amount || 0) / recurrence.months
      : 0);
  }, 0);
  const emiBills = bills.filter((bill) => bill.type === "EMI");
  const trackedEmiBills = emiBills.filter(
    (bill) => getRemainingInstallments(bill) !== null
  );
  const remainingEmiInstallments = trackedEmiBills.reduce(
    (sum, bill) => sum + getRemainingInstallments(bill),
    0
  );
  const ongoingEmiCount = emiBills.filter(
    (bill) => bill.status !== "completed" && getRemainingInstallments(bill) === null
  ).length;
  const paidThisMonth = bills.reduce((sum, bill) => sum + (
    Array.isArray(bill.payments) ? bill.payments : []
  )
    .filter((payment) => {
      const date = parseDate(payment.date);
      return date &&
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth();
    })
    .reduce((subtotal, payment) => subtotal + Number(payment.amount || 0), 0), 0);

  const handleAddBill = (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    const installmentCount = totalInstallments.trim()
      ? Number(totalInstallments)
      : null;
    if (!name.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0 ||
      !parseDate(dueDate)) {
      setNotice("Add a name, valid amount, and due date for this payment.");
      return;
    }
    if (type === "EMI" && installmentCount !== null &&
      (!Number.isInteger(installmentCount) || installmentCount < 1)) {
      setNotice("Enter a valid total installment count, or leave it blank.");
      return;
    }

    setNotice("");
    saveBills([
      ...bills,
      {
        id: `bill-${Date.now()}`,
        name: name.trim(),
        type,
        amount: numericAmount,
        dueDate,
        frequency,
        totalInstallments: type === "EMI" ? installmentCount : null,
        paidInstallments: 0,
        payments: [],
        status: "active",
      },
    ]);
    setName("");
    setAmount("");
    setDueDate(getToday());
    setFrequency("monthly");
    setTotalInstallments("");
  };

  const markPaid = (bill) => {
    if (availableBalance <= 0) {
      window.alert("There is no available balance to record this payment. Add income or update your existing transactions first.");
      return;
    }
    if (Number(bill.amount) > availableBalance) {
      window.alert(`Your available balance is ${formatMoney(availableBalance)}, which is less than this payment. Add income or update your transactions first.`);
      return;
    }
    if (paymentLocks.current.has(bill.id)) return;
    paymentLocks.current.add(bill.id);
    setPayingIds((ids) => [...ids, bill.id]);

    const paidAt = getToday();
    const payments = Array.isArray(bill.payments) ? bill.payments : [];
    const paymentId = `bill-payment-${bill.id}-${payments.length + 1}`;
    const installmentNumber = getPaidInstallments(bill) + 1;
    const recurrence = FREQUENCIES.find((item) => item.value === bill.frequency);
    const nextPaidCount = installmentNumber;
    const isComplete = bill.frequency === "once" ||
      (bill.totalInstallments && nextPaidCount >= bill.totalInstallments);
    const updatedBill = {
      ...bill,
      paidInstallments: nextPaidCount,
      status: isComplete ? "completed" : "active",
      dueDate: isComplete
        ? bill.dueDate
        : advanceDueDate(bill.dueDate, recurrence?.months || 1),
      payments: [
        ...payments,
        {
          id: paymentId,
          amount: Number(bill.amount),
          date: paidAt,
          dueDate: bill.dueDate,
          frequency: bill.frequency,
          installmentNumber,
          totalInstallments: bill.totalInstallments,
        },
      ],
    };
    saveBills(bills.map((item) => item.id === bill.id ? updatedBill : item));
    setExpense((items) => [
      ...items,
      {
        id: paymentId,
        title: `${bill.name} payment`,
        category: bill.type === "EMI" ? "EMI" : "Bills",
        amount: Number(bill.amount),
        date: paidAt,
        billId: bill.id,
        billType: bill.type,
        frequency: bill.frequency,
        dueDate: bill.dueDate,
        installmentNumber,
        totalInstallments: bill.totalInstallments,
        paymentStatus: "Paid",
      },
    ]);
    window.setTimeout(() => {
      paymentLocks.current.delete(bill.id);
      setPayingIds((ids) => ids.filter((id) => id !== bill.id));
    }, 500);
  };

  const deleteBill = (billId) => {
    saveBills(bills.filter((bill) => bill.id !== billId));
  };

  return (
    <Layout>
      <main className="bills-management">
        <header className="bills-page-heading">
          <div>
            <span className="bills-page-kicker">STAY AHEAD OF DUE DATES</span>
            <h1>Bills <span>&amp; EMI</span></h1>
            <p>Keep recurring payments visible and record them once when paid.</p>
          </div>
          <a href="#add-bill" className="bills-add-shortcut">
            <FaPlus aria-hidden="true" /> Add a payment
          </a>
        </header>

        <section className="bills-summary-grid" aria-label="Bills and EMI summary">
          <article className="bills-summary-card">
            <span className="bills-summary-icon monthly"><FaCreditCard /></span>
            <div><span>Monthly commitments</span><strong>{formatMoney(monthlyCommitments)}</strong><small>Monthly equivalent of recurring items</small></div>
          </article>
          <article className="bills-summary-card">
            <span className="bills-summary-icon due"><FaClock /></span>
            <div><span>Due within 7 days</span><strong>{formatMoney(dueSoonTotal)}</strong><small>{dueSoonBills.length} payment{dueSoonBills.length === 1 ? "" : "s"} approaching</small></div>
          </article>
          <article className="bills-summary-card">
            <span className="bills-summary-icon installments"><FaCreditCard /></span>
            <div>
              <span>Total EMI remaining</span>
              <strong>{remainingEmiInstallments}</strong>
              <small>
                {trackedEmiBills.length
                  ? `Across ${trackedEmiBills.length} EMI plan${trackedEmiBills.length === 1 ? "" : "s"}`
                  : emiBills.length
                    ? "Add total installments to track"
                    : "No EMI plans added yet"}
                {ongoingEmiCount > 0
                  ? ` · ${ongoingEmiCount} ongoing without a total`
                  : ""}
              </small>
            </div>
          </article>
          <article className="bills-summary-card">
            <span className={`bills-summary-icon ${overdueCount ? "overdue" : "paid"}`}>
              {overdueCount ? <FaClock /> : <FaCheck />}
            </span>
            <div><span>{overdueCount ? "Overdue payments" : "Paid this month"}</span><strong>{overdueCount ? overdueCount : formatMoney(paidThisMonth)}</strong><small>{overdueCount ? "Review the dates below" : "Recorded in your expenses and reports"}</small></div>
          </article>
        </section>

        {notice && <p className="bills-notice" role="alert">{notice}</p>}

        <div className="bills-content-grid">
          <section className="bills-form-panel" id="add-bill">
            <header className="bills-panel-heading">
              <span className="bills-form-icon"><FaReceipt /></span>
              <div><span className="bills-section-kicker">ADD TO YOUR CALENDAR</span><h2>Track a payment</h2><p>Enter the next due date and how often it repeats.</p></div>
            </header>
            <form className="bills-form" onSubmit={handleAddBill}>
              <label>
                <span>Payment name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Home loan" maxLength={80} required />
              </label>
              <div className="bills-form-row">
                <label>
                  <span>Type</span>
                  <select value={type} onChange={(event) => setType(event.target.value)}>
                    {BILL_TYPES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  <span>Amount</span>
                  <div className="bills-amount-field"><span aria-hidden="true">₹</span><input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" required /></div>
                </label>
              </div>
              <div className="bills-form-row">
                <label>
                  <span>Next due date</span>
                  <div className="bills-date-field"><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required /><FaCalendarAlt aria-hidden="true" /></div>
                </label>
                <label>
                  <span>Repeats</span>
                  <select value={frequency} onChange={(event) => setFrequency(event.target.value)}>
                    {FREQUENCIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
              </div>
              {type === "EMI" && (
                <label>
                  <span>Total installments <small>(optional)</small></span>
                  <input type="number" min="1" step="1" value={totalInstallments} onChange={(event) => setTotalInstallments(event.target.value)} placeholder="Leave blank if ongoing" />
                </label>
              )}
              <button className="bills-submit-button" type="submit"><FaPlus aria-hidden="true" /> Add payment</button>
              <p className="bills-form-footnote">Marking a payment paid adds one matching expense entry automatically.</p>
            </form>
          </section>

          <section className="bills-list-panel">
            <header className="bills-panel-heading bills-list-heading">
              <div><span className="bills-section-kicker">YOUR PAYMENT CALENDAR</span><h2>Upcoming payments</h2><p>Due dates advance when you record a payment.</p></div>
              <span className="bills-count-badge">{bills.filter((bill) => bill.status !== "completed").length} active</span>
            </header>
            {bills.length === 0 ? (
              <div className="bills-empty-state"><span><FaCalendarAlt /></span><h3>Your payment calendar is clear</h3><p>Add an EMI or recurring bill to see due dates, installments, and payment status here.</p></div>
            ) : (
              <div className="bills-list">
                {billStatuses.map(({ bill, status }) => {
                  const statusClass = status.toLowerCase().replace(/\s+/g, "-");
                  const paidInstallments = getPaidInstallments(bill);
                  const remainingInstallments = getRemainingInstallments(bill);
                  const emiDetailsExpanded = expandedEmiIds.includes(bill.id);
                  return (
                    <article className={`bill-item ${statusClass}`} key={bill.id}>
                      <div className="bill-item-icon"><FaReceipt aria-hidden="true" /></div>
                      <div className="bill-item-main">
                        <div className="bill-item-title-row"><h3>{bill.name}</h3><span className={`bill-status-pill ${statusClass}`}>{status}</span></div>
                        <p>{bill.type} <span>·</span> {bill.frequency === "once" ? "One-time" : (FREQUENCIES.find((item) => item.value === bill.frequency)?.label || "Monthly")}</p>
                        <div className="bill-item-meta">
                          <span><FaCalendarAlt aria-hidden="true" /> {bill.status === "completed" ? "Completed" : `Due ${formatDate(bill.dueDate)}`}</span>
                          {bill.type === "EMI" && (
                            <span>
                              {remainingInstallments === null
                                ? `${paidInstallments} installments paid · ongoing`
                                : `${remainingInstallments} EMI remaining · ${paidInstallments} of ${bill.totalInstallments} paid`}
                            </span>
                          )}
                        </div>
                        {bill.type === "EMI" && paidInstallments > 0 && (
                          <div className="bill-emi-details">
                            <button
                              className="bill-emi-details-toggle"
                              type="button"
                              aria-expanded={emiDetailsExpanded}
                              aria-controls={`emi-details-${bill.id}`}
                              onClick={() => setExpandedEmiIds((ids) => (
                                ids.includes(bill.id)
                                  ? ids.filter((id) => id !== bill.id)
                                  : [...ids, bill.id]
                              ))}
                            >
                              {emiDetailsExpanded ? <FaChevronUp aria-hidden="true" /> : <FaChevronDown aria-hidden="true" />}
                              {emiDetailsExpanded ? "Hide EMI details" : "Show EMI details"}
                            </button>
                            {emiDetailsExpanded && (
                              <div className="bill-emi-details-panel" id={`emi-details-${bill.id}`}>
                                <span>
                                  Total installments: <strong>{bill.totalInstallments || "Not set"}</strong>
                                </span>
                                <span>
                                  Installments paid: <strong>{paidInstallments}</strong>
                                </span>
                                <span>
                                  EMI remaining: <strong>{remainingInstallments ?? "Not tracked"}</strong>
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="bill-item-actions">
                        <strong>{formatMoney(bill.amount)}</strong>
                        {bill.status === "completed" ? (
                          <span className="bill-completed-label"><FaCheck aria-hidden="true" /> Complete</span>
                        ) : (
                          <button type="button" onClick={() => markPaid(bill)} disabled={payingIds.includes(bill.id)}>
                            <FaCheck aria-hidden="true" /> {payingIds.includes(bill.id) ? "Saving..." : "Mark paid"}
                          </button>
                        )}
                        <button type="button" className="bill-delete-button" onClick={() => deleteBill(bill.id)} aria-label={`Delete ${bill.name}`} title="Delete payment">
                          <FaTrash aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            <p className="bills-data-note">All bills and payment records are saved in this browser. A marked payment is included in your expense totals, budget tracking, and reports.</p>
          </section>
        </div>
      </main>
    </Layout>
  );
}

export default Bills;
