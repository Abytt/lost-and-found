// src/Components/ForgotPassword.jsx
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Updated import path

function ForgotPassword() {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage("Check your inbox for further instructions");
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("Failed to reset password. Make sure your email is correct.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center py-3">
              <h3 className="mb-0">Password Reset</h3>
            </div>
            <div className="card-body p-4">
              {error && <div className="alert alert-danger">{error}</div>}
              {message && <div className="alert alert-success">{message}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    ref={emailRef}
                    className="form-control"
                    required
                  />
                </div>
                <button
                  disabled={loading}
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Sending Reset Link...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
              <div className="mt-3 text-center">
                <Link to="/login" className="text-decoration-none">Back to Login</Link>
              </div>
              <hr />
              <div className="text-center">
                Need an account? <Link to="/signup" className="text-decoration-none">Sign Up</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;