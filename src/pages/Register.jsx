import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaLock,
  FaUserPlus,
} from "react-icons/fa";

import { authAPI } from "../services/api";
import "./Login.css";

function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authAPI.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice("");

    if (!name.trim()) {
      setNotice("Enter your name to continue.");
      return;
    }

    if (password !== confirmPassword) {
      setNotice("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setNotice("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authAPI.register({ name, email, password });
      navigate(location.state?.from?.pathname || "/", {
        replace: true,
      });
    } catch (error) {
      setNotice(error.message || "Could not create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-showcase" aria-label="Personal finance dashboard" />
      <section className="login-panel">
        <div className="login-card">
          <div className="login-mobile-brand">
            <span className="login-brand-icon"><FaUserPlus aria-hidden="true" /></span>
            <span>Finance<span className="login-brand-accent">OS</span></span>
          </div>
          <span className="login-card-icon"><FaLock aria-hidden="true" /></span>
          <span className="login-eyebrow login-card-eyebrow">GET STARTED</span>
          <h2>Create your account</h2>
          <p className="login-card-description">
            Sign up for a secure account backed by Spring Boot and MySQL.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
            />

            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />

            <label htmlFor="register-confirm-password">Confirm password</label>
            <input
              id="register-confirm-password"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              required
            />

            <button type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? "Creating account..." : "Create account"}</span>
              <FaArrowRight aria-hidden="true" />
            </button>
          </form>

          {notice && <p className="login-notice" role="alert">{notice}</p>}

          <p className="login-local-note" style={{ marginTop: "1rem" }}>
            Already have an account? <Link to="/login" style={{ color: "#3b82f6", fontWeight: "600" }}>Sign In</Link>
          </p>
        </div>
        <span className="login-panel-footer">PERSONAL FINANCE, MADE SIMPLE</span>
      </section>
    </main>
  );
}

export default Register;
