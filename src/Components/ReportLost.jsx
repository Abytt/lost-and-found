import React, { useState } from "react";
import { getDatabase, ref, push } from "firebase/database";
import { app } from "../firebase";
import { useAuth } from "./AuthContext";

const database = getDatabase(app);

function ReportLost() {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({ 
    type: "Lost", 
    document: "", 
    name: "", 
    location: "", 
    contact: "", 
    dateLost: "", 
    additionalDetails: "",
    email: currentUser.email,
    lat: null,
    lon: null,
    category: "",
    userId: currentUser.uid,
    userName: currentUser.displayName || ""
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const documentTypes = [
    { id: "Aadhaar", label: "Aadhaar Card", icon: "bi-card-heading" },
    { id: "PAN", label: "PAN Card", icon: "bi-credit-card" },
    { id: "Voter", label: "Voter ID Card", icon: "bi-person-badge" },
    { id: "Driving", label: "Driving License", icon: "bi-car-front" },
    { id: "Passport", label: "Passport", icon: "bi-booklet" },
    { id: "Other", label: "Other Document", icon: "bi-file-earmark-text" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Set category based on document type for better matching
    if (name === "document") {
      setForm(prev => ({
        ...prev,
        [name]: value,
        category: value
      }));
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm({
            ...form,
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationLoading(false);
          alert("Unable to get your location. Please enter the location manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newEntry = { 
      ...form, 
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    try {
      await push(ref(database, 'entries'), newEntry);
      console.log("Entry added successfully:", newEntry);
      setSuccessMessage("Your report has been submitted successfully!");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setForm({ 
        type: "Lost", 
        document: "", 
        name: "", 
        location: "", 
        contact: "", 
        dateLost: "", 
        additionalDetails: "",
        email: currentUser.email,
        lat: null,
        lon: null,
        category: "",
        userId: currentUser.uid,
        userName: currentUser.displayName || ""
      });
    } catch (error) {
      console.error("Error adding entry:", error);
      setSuccessMessage("There was an error submitting your report. Please try again.");
    }
  };

  const toggleTips = () => {
    setShowTips(!showTips);
  };

  return (
    <div className="container py-5 mt-4">
      {successMessage && (
        <div className="row justify-content-center mb-4">
          <div className="col-md-10 col-lg-8">
            <div className="alert alert-success shadow-sm border-0 d-flex align-items-center" role="alert">
              <i className="bi bi-check-circle-fill text-success me-2 fs-4"></i>
              <div>
                <strong>Success!</strong> {successMessage}
                <div className="mt-2">
                  <a href="/my-reports" className="btn btn-sm btn-outline-success me-2">
                    <i className="bi bi-list-ul me-1"></i> View My Reports
                  </a>
                  <a href="/report-found" className="btn btn-sm btn-outline-primary">
                    <i className="bi bi-plus-circle me-1"></i> Report a Found Item
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="card shadow-lg border-0 rounded-lg overflow-hidden">
            <div className="card-header bg-gradient bg-primary text-white p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-0 fw-bold">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Report a Lost Document
                  </h3>
                  <p className="mb-0 mt-2 text-white-50">Complete the form below with accurate details</p>
                </div>
                <div className="text-center">
                  <span className="badge bg-light text-primary p-2 rounded-pill">
                    <i className="bi bi-shield-check"></i> Secure Submission
                  </span>
                </div>
              </div>
            </div>
            
            <div className="card-body p-4">
              <div className="d-flex justify-content-between mb-4">
                <p className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  All fields marked with <span className="text-danger">*</span> are required
                </p>
                <button 
                  className="btn btn-sm btn-outline-secondary rounded-pill"
                  onClick={toggleTips}
                >
                  <i className={`bi ${showTips ? 'bi-chevron-up' : 'bi-chevron-down'} me-1`}></i>
                  {showTips ? 'Hide Tips' : 'Show Tips'}
                </button>
              </div>

              {showTips && (
                <div className="alert alert-info bg-light border-start border-info border-3 mb-4">
                  <h6 className="fw-bold"><i className="bi bi-lightbulb me-2"></i>Reporting Tips</h6>
                  <ul className="mb-0 ps-3">
                    <li>Provide the exact name as it appears on your document</li>
                    <li>Be as specific as possible about where you last had your document</li>
                    <li>Using the location pin feature can help find better matches</li>
                    <li>Add any unique identifying details that might help verify ownership</li>
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Document Type <span className="text-danger">*</span>
                  </label>
                  <div className="row row-cols-2 row-cols-md-3 g-2 mb-2">
                    {documentTypes.map(doc => (
                      <div key={doc.id} className="col">
                        <div 
                          className={`card h-100 border ${form.document === doc.id ? 'border-primary' : 'border-light'} doc-card`}
                          onClick={() => setForm({...form, document: doc.id, category: doc.id})}
                          style={{cursor: 'pointer'}}
                        >
                          <div className="card-body p-2 text-center">
                            <i className={`bi ${doc.icon} fs-4 ${form.document === doc.id ? 'text-primary' : 'text-muted'}`}></i>
                            <p className="mb-0 small mt-1">{doc.label}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <select 
                    className="form-select d-none"  // Hidden but still part of the form
                    name="document" 
                    value={form.document} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">Select document type</option>
                    {documentTypes.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.label}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Name on Document <span className="text-danger">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control form-control-lg" 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    placeholder="Full name as shown on document" 
                    required 
                  />
                  <div className="form-text">Enter the name exactly as it appears on your document</div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold">
                      Date Lost <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-calendar-event text-primary"></i>
                      </span>
                      <input 
                        type="date" 
                        className="form-control" 
                        name="dateLost" 
                        value={form.dateLost} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Location Lost <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-geo-alt text-danger"></i>
                      </span>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="location" 
                        value={form.location} 
                        onChange={handleChange} 
                        placeholder="e.g., Park, Office, Mall" 
                        required 
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline-primary" 
                        onClick={getLocation}
                        disabled={locationLoading}
                      >
                        {locationLoading ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          <i className="bi bi-crosshair"></i>
                        )}
                      </button>
                    </div>
                    {form.lat && form.lon && (
                      <div className="form-text text-success">
                        <i className="bi bi-check-circle-fill me-1"></i> Location coordinates captured
                      </div>
                    )}
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold">
                      Contact Number <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-telephone text-success"></i>
                      </span>
                      <input 
                        type="tel" 
                        className="form-control" 
                        name="contact" 
                        value={form.contact} 
                        onChange={handleChange} 
                        placeholder="Your phone number" 
                        required 
                      />
                    </div>
                    <div className="form-text">We'll use this to contact you if a match is found</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-envelope text-secondary"></i>
                      </span>
                      <input 
                        type="email" 
                        className="form-control" 
                        name="email" 
                        value={form.email} 
                        onChange={handleChange} 
                        placeholder="Your email" 
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Additional Details</label>
                  <textarea 
                    className="form-control" 
                    name="additionalDetails" 
                    value={form.additionalDetails} 
                    onChange={handleChange} 
                    rows="4" 
                    placeholder="Any identifying details that might help (e.g., document number, distinguishing marks, etc.)"
                  ></textarea>
                  <div className="form-text">Share any details that could help identify your document</div>
                </div>

                <div className="card bg-light border-0 mb-4">
                  <div className="card-body">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="agreeTerms" required />
                      <label className="form-check-label" htmlFor="agreeTerms">
                        I verify that all information is accurate and I am the rightful owner of this document
                      </label>
                    </div>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary btn-lg">
                    <i className="bi bi-cloud-upload me-2"></i>Submit Report
                  </button>
                  <button type="reset" className="btn btn-light">
                    <i className="bi bi-arrow-clockwise me-2"></i>Reset Form
                  </button>
                </div>
              </form>
            </div>
            
            <div className="card-footer bg-light p-4 border-top">
              <div className="row align-items-center">
                <div className="col-md-6 mb-3 mb-md-0">
                  <h6 className="mb-0 text-muted">
                    <i className="bi bi-shield-check me-2"></i>Your privacy is important to us
                  </h6>
                  <small className="text-muted">We'll only share your contact details with verified matches</small>
                </div>
                <div className="col-md-6 text-md-end">
                  <a href="/faq" className="btn btn-sm btn-link text-decoration-none">
                    <i className="bi bi-question-circle me-1"></i>FAQs
                  </a>
                  <a href="/contact" className="btn btn-sm btn-link text-decoration-none ms-2">
                    <i className="bi bi-chat-dots me-1"></i>Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportLost;