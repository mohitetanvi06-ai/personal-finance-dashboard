function escapeCsv(value) {
  const text = String(value ?? "");
  const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

export function downloadTransactions(items, fileName, bills = []) {
  const totalIncome = items.reduce(
    (sum, item) => item.type === "Income" ? sum + Number(item.amount || 0) : sum,
    0
  );
  const totalExpenses = items.reduce(
    (sum, item) => item.type === "Expense" ? sum + Number(item.amount || 0) : sum,
    0
  );
  const rows = [
    [
      "Entry ID",
      "Date",
      "Type",
      "Description",
      "Category",
      "Amount (INR)",
      "Bill/EMI type",
      "Frequency",
      "Due date",
      "Installment",
      "Total installments",
      "Payment status",
    ],
    ...items.map((item) => {
      const bill = bills.find((savedBill) => (
        savedBill.id === item.billId ||
        (Array.isArray(savedBill.payments) &&
          savedBill.payments.some((payment) => String(payment.id) === String(item.id)))
      ));
      const payment = bill?.payments?.find(
        (savedPayment) => String(savedPayment.id) === String(item.id)
      );
      return [
        item.id ?? "",
        item.date || "",
        item.type,
        item.title || "",
        item.category || (item.type === "Income" ? "Income" : "Other"),
        Number(item.amount || 0).toFixed(2),
        item.billType || bill?.type || "",
        item.frequency || payment?.frequency || bill?.frequency || "",
        item.dueDate || payment?.dueDate || "",
        item.installmentNumber ?? payment?.installmentNumber ?? "",
        item.totalInstallments ?? payment?.totalInstallments ?? bill?.totalInstallments ?? "",
        item.paymentStatus || (bill ? "Paid" : ""),
      ];
    }),
    [],
    ["", "", "TOTAL", "Total income", "", totalIncome.toFixed(2), "", "", "", "", "", ""],
    ["", "", "TOTAL", "Total expenses", "", totalExpenses.toFixed(2), "", "", "", "", "", ""],
    ["", "", "TOTAL", "Net balance", "", (totalIncome - totalExpenses).toFixed(2), "", "", "", "", "", ""],
  ];
  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
