import { useState } from "react";
import { FaCalculator } from "react-icons/fa";
import "./QuickCalculator.css";

const calculate = (left, right, operator) => {
  switch (operator) {
    case "+":
      return left + right;
    case "−":
      return left - right;
    case "×":
      return left * right;
    case "÷":
      return right === 0 ? null : left / right;
    default:
      return right;
  }
};

const formatResult = (value) => String(Number(value.toPrecision(10)));

function QuickCalculator() {
  const [display, setDisplay] = useState("0");
  const [storedValue, setStoredValue] = useState(null);
  const [pendingOperator, setPendingOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const reset = () => {
    setDisplay("0");
    setStoredValue(null);
    setPendingOperator(null);
    setWaitingForOperand(false);
  };

  const enterDigit = (digit) => {
    if (display === "Error" || waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
      return;
    }

    setDisplay((current) => (current === "0" ? digit : `${current}${digit}`));
  };

  const enterDecimal = () => {
    if (display === "Error" || waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (!display.includes(".")) {
      setDisplay(`${display}.`);
    }
  };

  const chooseOperator = (operator) => {
    const currentValue = Number(display);
    if (!Number.isFinite(currentValue)) return;

    if (pendingOperator && !waitingForOperand) {
      const result = calculate(storedValue, currentValue, pendingOperator);
      if (result === null || !Number.isFinite(result)) {
        setDisplay("Error");
        setStoredValue(null);
        setPendingOperator(null);
        setWaitingForOperand(true);
        return;
      }

      const normalizedResult = Number(formatResult(result));
      setDisplay(String(normalizedResult));
      setStoredValue(normalizedResult);
    } else {
      setStoredValue(currentValue);
    }

    setPendingOperator(operator);
    setWaitingForOperand(true);
  };

  const showResult = () => {
    if (!pendingOperator || storedValue === null || waitingForOperand) return;

    const result = calculate(storedValue, Number(display), pendingOperator);
    if (result === null || !Number.isFinite(result)) {
      setDisplay("Error");
    } else {
      setDisplay(formatResult(result));
    }
    setStoredValue(null);
    setPendingOperator(null);
    setWaitingForOperand(true);
  };

  const handleKeyDown = (event) => {
    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      enterDigit(event.key);
    } else if (event.key === ".") {
      event.preventDefault();
      enterDecimal();
    } else if (["+", "-", "*", "/"].includes(event.key)) {
      event.preventDefault();
      chooseOperator({ "+": "+", "-": "−", "*": "×", "/": "÷" }[event.key]);
    } else if (event.key === "=" || (event.key === "Enter" && event.target.tagName !== "BUTTON")) {
      event.preventDefault();
      showResult();
    } else if (event.key === "Backspace") {
      event.preventDefault();
      if (!waitingForOperand && display !== "Error") {
        setDisplay((current) => current.length > 1 ? current.slice(0, -1) : "0");
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      reset();
    } else if (event.key === "%") {
      event.preventDefault();
      if (display !== "Error") setDisplay(String(Number(display) / 100));
    }
  };

  const keys = [
    { label: "AC", type: "utility", action: reset, ariaLabel: "Clear all" },
    {
      label: "±",
      type: "utility",
      action: () => display !== "Error" && setDisplay(String(-Number(display))),
      ariaLabel: "Change sign",
    },
    {
      label: "%",
      type: "utility",
      action: () => display !== "Error" && setDisplay(String(Number(display) / 100)),
      ariaLabel: "Percent",
    },
    { label: "÷", type: "operator", action: () => chooseOperator("÷") },
    ...["7", "8", "9"].map((digit) => ({
      label: digit,
      action: () => enterDigit(digit),
    })),
    { label: "×", type: "operator", action: () => chooseOperator("×") },
    ...["4", "5", "6"].map((digit) => ({
      label: digit,
      action: () => enterDigit(digit),
    })),
    { label: "−", type: "operator", action: () => chooseOperator("−") },
    ...["1", "2", "3"].map((digit) => ({
      label: digit,
      action: () => enterDigit(digit),
    })),
    { label: "+", type: "operator", action: () => chooseOperator("+") },
    { label: "0", action: () => enterDigit("0"), wide: true },
    { label: ".", action: enterDecimal },
    { label: "=", type: "equals", action: showResult },
  ];

  return (
    <section
      className="dashboard-calculator"
      id="dashboard-calculator"
      aria-labelledby="dashboard-calculator-title"
      onKeyDown={handleKeyDown}
      tabIndex="0"
    >
      <header className="dashboard-calculator-heading">
        <span className="dashboard-calculator-icon"><FaCalculator aria-hidden="true" /></span>
        <div>
          <h3 id="dashboard-calculator-title">Quick calculator</h3>
          <p>For quick everyday calculations</p>
        </div>
      </header>
      <output className="dashboard-calculator-display" aria-live="polite" aria-atomic="true">
        {display}
      </output>
      <div className="dashboard-calculator-keys">
        {keys.map(({ label, type = "", action, ariaLabel, wide }) => (
          <button
            className={[
              "dashboard-calculator-key",
              type ? ` ${type}` : "",
              wide ? " wide" : "",
              type === "operator" && pendingOperator === label ? " selected" : "",
            ].join("")}
            key={label}
            type="button"
            onClick={action}
            aria-label={ariaLabel || label}
            aria-pressed={type === "operator" ? pendingOperator === label : undefined}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default QuickCalculator;
