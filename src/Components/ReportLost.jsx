import React, { useState } from "react";
import { getDatabase, ref, push } from "firebase/database";
import { app } from "../firebase";

const database = getDatabase(app);

function ReportLost() {
  const [form, setForm] = useState({ 
    type: "Lost", 
    document: "", 
    name: "", 
    location: "", 
    contact: "", 
    dateLost: "", 
    additionalDetails: "",
    email: "",
    lat: null,
    lon: null,
    category: "" // Adding category field for better matching
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Set category based on document type for better matching
    if (name === "document") {
      setForm(prev => ({
        ...prev,
        [name]: value,
        category: value // Use document type as category
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
    
    console.log("Form Data:", newEntry); // Log form data
    
    try {
      await push(ref(database, 'entries'), newEntry);
      console.log("Entry added successfully:", newEntry);
      setSuccessMessage("Your report has been submitted successfully!");
      setForm({ 
        type: "Lost", 
        document: "", 
        name: "", 
        location: "", 
        contact: "", 
        dateLost: "", 
        additionalDetails: "",
        email: "",
        lat: null,
        lon: null,
        category: ""
      });
    } catch (error) {
      console.error("Error adding entry:", error);
      setSuccessMessage("There was an error submitting your report. Please try again.");
    }
  };

  return (
    <div className="container py-5 mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center py-3">
              <h3 className="mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Report a Lost Document
              </h3>
            </div>
            <div className="card-body p-4">
              <p className="text-center mb-4">
                Please provide accurate details to help us match your document if found.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Document Type</label>
                  <select className="form-select" name="document" value={form.document} onChange={handleChange} required>
                    <option value="">Select document type</option>
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="PAN">PAN Card</option>
                    <option value="Voter">Voter ID Card</option>
                    <option value="Driving">Driving License</option>
                    <option value="Passport">Passport</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Name on Document</label>
                  <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Full name as shown on document" required />
                </div>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold">Date Lost</label>
                    <input type="date" className="form-control" name="dateLost" value={form.dateLost} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Location Lost</label>
                    <div className="input-group">
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
                        className="btn btn-outline-secondary" 
                        onClick={getLocation}
                        disabled={locationLoading}
                      >
                        {locationLoading ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                          <i className="bi bi-geo-alt"></i>
                        )}
                      </button>
                    </div>
                    {form.lat && form.lon && (
                      <small className="text-success">
                        <i className="bi bi-check-circle"></i> Location coordinates captured
                      </small>
                    )}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold">Contact Number</label>
                    <input type="tel" className="form-control" name="contact" value={form.contact} onChange={handleChange} placeholder="Your phone number" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Email Address</label>
                    <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} placeholder="Your email" required />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Additional Details</label>
                  <textarea className="form-control" name="additionalDetails" value={form.additionalDetails} onChange={handleChange} rows="3" placeholder="Any identifying details that might help"></textarea>
                </div>
                <div className="form-check mb-4">
                  <input className="form-check-input" type="checkbox" id="agreeTerms" required />
                  <label className="form-check-label" htmlFor="agreeTerms">
                    I verify that all information is accurate and I am the rightful owner of this document
                  </label>
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2">
                  <i className="bi bi-cloud-upload me-2"></i>Submit Report
                </button>
              </form>
              {successMessage && (
                <div className="alert alert-success mt-3">
                  {successMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportLost;