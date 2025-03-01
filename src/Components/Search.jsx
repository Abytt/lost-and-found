import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../firebase";

const database = getDatabase(app);

function Search() {
  const [searchType, setSearchType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const entriesRef = ref(database, 'entries');
    onValue(entriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entriesArray = Object.values(data);
        setEntries(entriesArray);
        setFilteredEntries(entriesArray); // Initialize filtered entries with all entries
      }
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    let filtered = entries;
    if (searchType !== "all") {
      filtered = filtered.filter(entry => entry.type.toLowerCase() === searchType);
    }
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredEntries(filtered);
  };

  const handleViewDetails = (entry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetails = () => {
    setSelectedEntry(null);
  };

  return (
    <div className="container py-5 mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-info text-white text-center py-3">
              <h3 className="mb-0">
                <i className="bi bi-search me-2"></i>
                Search Lost & Found Documents
              </h3>
            </div>
            <div className="card-body p-4">
              <p className="text-center mb-4">
                Search through reported lost and found documents to find potential matches.
              </p>
              <form className="mb-4" onSubmit={handleSearch}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <select className="form-select" aria-label="Search type" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                      <option value="all">All Documents</option>
                      <option value="lost">Lost Documents</option>
                      <option value="found">Found Documents</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <select className="form-select" aria-label="Document type" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}>
                      <option value="">All Document Types</option>
                      <option value="Aadhaar">Aadhaar Card</option>
                      <option value="PAN">PAN Card</option>
                      <option value="Voter">Voter ID Card</option>
                      <option value="Driving">Driving License</option>
                      <option value="Passport">Passport</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-9">
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-search"></i>
                      </span>
                      <input type="text" className="form-control" placeholder="Search by name, location, or date..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <button type="submit" className="btn btn-primary w-100">
                      Search
                    </button>
                  </div>
                </div>
              </form>
              <div className="alert alert-info" role="alert">
                <i className="bi bi-info-circle me-2"></i>
                To protect privacy, search results will only show basic information. To claim a document, you'll need to verify ownership.
              </div>
              <div className="mt-4">
                <h4 className="mb-3">Search Results</h4>
                {filteredEntries.length > 0 ? (
                  <ul className="list-group">
                    {filteredEntries.map((entry) => (
                      <li key={entry.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h5 className="mb-0">
                            <span className={`badge bg-${entry.type === "Lost" ? "danger" : "success"} me-2`}>{entry.type}</span>
                            {entry.document}
                          </h5>
                          <span className="text-muted small">{new Date(entry.id).toLocaleDateString()}</span>
                        </div>
                        <p className="mb-2"><strong>Location:</strong> {entry.location}</p>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleViewDetails(entry)}>
                          View Details
                        </button>
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

      {/* Detailed View Modal */}
      {selectedEntry && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Entry Details</h5>
                <button type="button" className="btn-close" onClick={handleCloseDetails}></button>
              </div>
              <div className="modal-body">
                <p><strong>Document:</strong> {selectedEntry.document}</p>
                <p><strong>Name:</strong> {selectedEntry.name}</p>
                <p><strong>Location:</strong> {selectedEntry.location}</p>
                <p><strong>Type:</strong> {selectedEntry.type}</p>
                <p><strong>Date:</strong> {new Date(selectedEntry.id).toLocaleDateString()}</p>
                {/* Add more details as needed */}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDetails}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
