import React, { useState } from "react";
import { getDatabase, ref, push } from "firebase/database";
import { app } from "../firebase";

const database = getDatabase(app);

function ReportFound() {
  const [form, setForm] = useState({ type: "Found", document: "", name: "", location: "", contact: "", dateFound: "", description: "", currentLocation: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newEntry = { ...form, id: Date.now() };
    console.log("Form Data:", newEntry); // Log form data
    try {
      await push(ref(database, 'entries'), newEntry);
      console.log("Entry added successfully:", newEntry);
      setForm({ type: "Found", document: "", name: "", location: "", contact: "", dateFound: "", description: "", currentLocation: "" });
    } catch (error) {
      console.error("Error adding entry:", error);
    }
  };

  return (
    <div className="container py-5 mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-success text-white text-center py-3">
              <h3 className="mb-0">
                <i className="bi bi-check-circle me-2"></i>
                Report a Found Document
              </h3>
            </div>
            <div className="card-body p-4">
              <p className="text-center mb-4">
                Thank you for helping return this document to its owner. Please provide the details below.
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
                  <label className="form-label fw-bold">Document Holder's Name</label>
                  <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Name as shown on document (if visible)" />
                  <small className="text-muted">Leave blank if name is not visible/readable</small>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold">Date Found</label>
                    <input type="date" className="form-control" name="dateFound" value={form.dateFound} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Location Found</label>
                    <input type="text" className="form-control" name="location" value={form.location} onChange={handleChange} placeholder="e.g., Park, Office, Mall" required />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold">Your Contact Number</label>
                    <input type="tel" className="form-control" name="contact" value={form.contact} onChange={handleChange} placeholder="Your phone number" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Your Email Address</label>
                    <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} placeholder="Your email" required />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Document Description</label>
                  <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Physical description without revealing sensitive details"></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Where is the document now?</label>
                  <select className="form-select" name="currentLocation" value={form.currentLocation} onChange={handleChange} required>
                    <option value="">Select an option</option>
                    <option value="withMe">I have it with me</option>
                    <option value="policeStation">Submitted to police station</option>
                    <option value="publicPlace">Left at a public location</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-check mb-4">
                  <input className="form-check-input" type="checkbox" id="agreeTerms" required />
                  <label className="form-check-label" htmlFor="agreeTerms">
                    I verify that all information is accurate and I have not shared any sensitive information
                  </label>
                </div>
                <button type="submit" className="btn btn-success w-100 py-2">
                  <i className="bi bi-cloud-upload me-2"></i>Submit Report
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportFound;
