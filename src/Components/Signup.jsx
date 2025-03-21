// src/Components/Signup.jsx
import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Updated import path
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Signup() {
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup, updateUserProfile } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);
      
      // Create the user
      const userCredential = await signup(emailRef.current.value, passwordRef.current.value);
      
      // Update the user's display name
      await updateUserProfile(nameRef.current.value);
      
      // Add user to Firestore with admin flag
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: emailRef.current.value,
        name: nameRef.current.value,
        isAdmin: false  // Default to non-admin
      });

      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("Error signing up:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please use a different email or log in.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.");
      } else {
        setError("Failed to create an account. Please try again.");
      }
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
              <h3 className="mb-0">Sign Up</h3>
            </div>
            <div className="card-body p-4">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    ref={nameRef}
                    className="form-control"
                    required
                  />
                </div>
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
                    minLength="6"
                  />
                  <small className="text-muted">Password must be at least 6 characters long</small>
                </div>
                <div className="mb-3">
                  <label htmlFor="password-confirm" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    id="password-confirm"
                    ref={passwordConfirmRef}
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
                      Creating Account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </form>
              <hr />
              <div className="text-center">
                Already have an account? <Link to="/login" className="text-decoration-none">Log In</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;