// src/Components/Login.jsx
import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Updated import path

function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate("/"); // Redirect to homepage after login
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Failed to log in. Please check your credentials.");
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
              <h3 className="mb-0">Login</h3>
            </div>
            <div className="card-body p-4">
              {error && <div className="alert alert-danger">{error}</div>}
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
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    ref={passwordRef}
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
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </button>
              </form>
              <div className="mt-3 text-center">
                <Link to="/forgot-password" className="text-decoration-none">Forgot Password?</Link>
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

export default Login;