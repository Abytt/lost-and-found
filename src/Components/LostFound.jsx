import React, { useState, useEffect } from "react";
import { getDatabase, ref, push, onValue } from "firebase/database";
import { app } from "../firebase";

const database = getDatabase(app);

function LostFound() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ type: "Lost", document: "", name: "", location: "", contact: "" });

  useEffect(() => {
    const entriesRef = ref(database, 'entries');
    onValue(entriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entriesArray = Object.values(data);
        setEntries(entriesArray);
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newEntry = { ...form, id: Date.now() };
    try {
      await push(ref(database, 'entries'), newEntry);
      console.log("Entry added successfully:", newEntry);
      setForm({ type: "Lost", document: "", name: "", location: "", contact: "" });
    } catch (error) {
      console.error("Error adding entry:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center">Lost & Found</h1>
      <div className="row">
        <div className="col-md-6">
          <div className="card shadow mb-4">
            <div className="card-header bg-primary text-white text-center py-3">
              <h3 className="mb-0">Add New Entry</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Type</label>
                  <select className="form-select" name="type" value={form.type} onChange={handleChange} required>
                    <option value="Lost">Lost</option>
                    <option value="Found">Found</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Document</label>
                  <input type="text" className="form-control" name="document" value={form.document} onChange={handleChange} placeholder="Document type" required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Name</label>
                  <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="Full name as shown on document" required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Location</label>
                  <input type="text" className="form-control" name="location" value={form.location} onChange={handleChange} placeholder="e.g., Park, Office, Mall" required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Contact</label>
                  <input type="tel" className="form-control" name="contact" value={form.contact} onChange={handleChange} placeholder="Your phone number" required />
                </div>
                <button type="submit" className="btn btn-primary w-100">Add Entry</button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow mb-4">
            <div className="card-header bg-info text-white text-center py-3">
              <h3 className="mb-0">Recent Entries</h3>
            </div>
            <div className="card-body">
              {entries.length > 0 ? (
                <ul className="list-group">
                  {entries.map((entry) => (
                    <li key={entry.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">
                          <span className={`badge bg-${entry.type === "Lost" ? "danger" : "success"} me-2`}>{entry.type}</span>
                          {entry.document}
                        </h5>
                        <span className="text-muted small">{new Date(entry.id).toLocaleDateString()}</span>
                      </div>
                      <p className="mb-2"><strong>Name:</strong> {entry.name}</p>
                      <p className="mb-2"><strong>Location:</strong> {entry.location}</p>
                      <p className="mb-2"><strong>Contact:</strong> {entry.contact}</p>
                      <button className="btn btn-sm btn-outline-primary">View Details</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No entries found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LostFound;
