import { useState } from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import {
  FaArrowRight,
  FaChartLine,
  FaCoins,
  FaLock,
  FaWallet,
} from "react-icons/fa";

import "./Login.css";
import { authAPI } from "../services/api";

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authAPI.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice("");
    setIsSubmitting(true);
    try {
      await authAPI.login({ email, password });
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (error) {
      setNotice(error.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-showcase" aria-label="Personal finance dashboard">
        <div className="login-brand" aria-label="FinanceOS">
          <span className="login-brand-icon"><FaWallet aria-hidden="true" /></span>
          <span>Finance<span className="login-brand-accent">OS</span></span>
        </div>

        <div className="login-showcase-copy">
          <span className="login-eyebrow">YOUR MONEY, IN FOCUS</span>
          <h1>Make every rupee<br />work for you.</h1>
          <p>
            A clearer view of your income, spending, and goals backed by a secure MySQL database.
          </p>

          <div className="login-feature-list">
            <div><FaChartLine aria-hidden="true" /><span>See where your money goes</span></div>
            <div><FaCoins aria-hidden="true" /><span>Build budgets that work for you</span></div>
            <div><FaWallet aria-hidden="true" /><span>Keep all your finances secure and synced</span></div>
          </div>
        </div>

        <div className="login-preview" aria-hidden="true">
          <div className="login-preview-heading">
            <span>Monthly overview</span>
            <span className="login-preview-period">THIS MONTH</span>
          </div>
          <div className="login-preview-amount">₹ 48,650</div>
          <div className="login-preview-caption"><FaChartLine /> Your finances at a glance</div>
          <div className="login-preview-bars">
            {[42, 63, 49, 78, 57, 91, 70, 100, 68, 84, 55, 76].map((height, index) => (
              <span key={index} style={{ "--bar-height": `${height}%` }} />
            ))}
          </div>
        </div>

        <span className="login-showcase-footer">A smarter way to manage your money.</span>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-mobile-brand">
            <span className="login-brand-icon"><FaWallet aria-hidden="true" /></span>
            <span>Finance<span className="login-brand-accent">OS</span></span>
          </div>
          <span className="login-card-icon"><FaLock aria-hidden="true" /></span>
          <span className="login-eyebrow login-card-eyebrow">WELCOME BACK</span>
          <h2>Sign in to your dashboard</h2>
          <p className="login-card-description">
            Enter your credentials to access your finance dashboard.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? "Signing in..." : "Continue to dashboard"}</span>
              <FaArrowRight aria-hidden="true" />
            </button>
          </form>

          {notice && <p className="login-notice" role="alert">{notice}</p>}

          <p className="login-local-note" style={{ marginTop: "1rem" }}>
            Don't have an account? <Link to="/register" style={{ color: "#3b82f6", fontWeight: "600" }}>Create one</Link>
          </p>
        </div>
        <span className="login-panel-footer">PERSONAL FINANCE, MADE SIMPLE</span>
      </section>
    </main>
  );
}

export default Login;
