// src/Components/Profile.jsx
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { updateEmail, updatePassword } from "firebase/auth";

function Profile() {
  const { currentUser, updateUserProfile } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();

  function handleToggleEdit() {
    setEditMode(!editMode);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match");
    }
    
    const promises = [];
    setLoading(true);
    setError("");
    setSuccess("");

    // Update display name
    if (nameRef.current.value !== currentUser.displayName) {
      promises.push(updateUserProfile(nameRef.current.value));
    }
    
    // Update email
    if (emailRef.current.value !== currentUser.email) {
      promises.push(updateEmail(currentUser, emailRef.current.value));
    }
    
    // Update password
    if (passwordRef.current.value) {
      promises.push(updatePassword(currentUser, passwordRef.current.value));
    }
    
    // Process all updates
    if (promises.length > 0) {
      Promise.all(promises)
        .then(() => {
          setSuccess("Profile updated successfully");
          setEditMode(false);
        })
        .catch((error) => {
          console.error("Error updating profile:", error);
          setError("Failed to update profile. Please try again.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      setSuccess("No changes made");
      setEditMode(false);
    }
  }

  return (
    <div className="container py-5 mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center py-3">
              <h3 className="mb-0">Your Profile</h3>
            </div>
            <div className="card-body p-4">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              
              {!editMode ? (
                // View Mode
                <>
                  <div className="text-center mb-4">
                    <div className="display-1 text-primary mb-3">
                      <i className="bi bi-person-circle"></i>
                    </div>
                    <h4>{currentUser.displayName || "User"}</h4>
                    <p className="text-muted">{currentUser.email}</p>
                    <button 
                      className="btn btn-primary mt-2" 
                      onClick={handleToggleEdit}
                    >
                      Edit Profile
                    </button>
                  </div>
                  
                  <div className="card mb-3">
                    <div className="card-body">
                      <h5 className="card-title">Account Information</h5>
                      <p><strong>Email Verified:</strong> {currentUser.emailVerified ? "Yes" : "No"}</p>
                      <p><strong>Account Created:</strong> {new Date(currentUser.metadata.creationTime).toLocaleDateString()}</p>
                      <p><strong>Last Login:</strong> {new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <Link to="/my-reports" className="btn btn-outline-primary">
                      View My Reports
                    </Link>
                  </div>
                </>
              ) : (
                // Edit Mode
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                      type="text"
                      id="name"
                      ref={nameRef}
                      className="form-control"
                      defaultValue={currentUser.displayName || ""}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      id="email"
                      ref={emailRef}
                      className="form-control"
                      defaultValue={currentUser.email}
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
                      placeholder="Leave blank to keep the same"
                    />
                    <small className="text-muted">Enter new password only if you want to change it</small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password-confirm" className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      id="password-confirm"
                      ref={passwordConfirmRef}
                      className="form-control"
                      placeholder="Leave blank to keep the same"
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleToggleEdit}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;