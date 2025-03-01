import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../firebase"; // Correct the import path

const database = getDatabase(app);

function LostFound() {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const entriesRef = ref(database, "entries");
    onValue(entriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entriesArray = Object.values(data);
        setEntries(entriesArray);
      }
    });
  }, []);

  const handleViewDetails = (entry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetails = () => {
    setSelectedEntry(null);
  };

  const containerStyle = {
    maxWidth: "900px",
    margin: "auto",
    padding: "20px",
    fontFamily: "'Arial', sans-serif",
  };

  const headerStyle = {
    textAlign: "center",
    color: "#333",
    marginBottom: "20px",
  };

  const flexContainer = {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
  };

  const columnStyle = {
    flex: 1,
    background: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const thTdStyle = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
  };

  const thStyle = {
    background: "#f4f4f4",
    fontWeight: "bold",
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Lost & Found</h1>

      <div style={flexContainer}>
        {/* Lost Items (Left Side) */}
        <div style={columnStyle}>
          <h2 style={{ color: "#d9534f" }}>Lost Items</h2>
          {entries.filter((entry) => entry.type === "Lost").length > 0 ? (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thTdStyle, ...thStyle }}>Document</th>
                  <th style={{ ...thTdStyle, ...thStyle }}>Name</th>
                  <th style={{ ...thTdStyle, ...thStyle }}>Location</th>
                  <th style={{ ...thTdStyle, ...thStyle }}>Contact</th>
                  <th style={{ ...thTdStyle, ...thStyle }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries
                  .filter((entry) => entry.type === "Lost")
                  .map((entry) => (
                    <tr key={entry.id}>
                      <td style={thTdStyle}>{entry.document}</td>
                      <td style={thTdStyle}>{entry.name}</td>
                      <td style={thTdStyle}>{entry.location}</td>
                      <td style={thTdStyle}>{entry.contact}</td>
                      <td style={thTdStyle}>
                        <button
                          style={{ background: "#007bff", color: "white", padding: "5px", borderRadius: "5px", border: "none", cursor: "pointer" }}
                          onClick={() => handleViewDetails(entry)}
                        >
                          More Details
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p>No lost items found.</p>
          )}
        </div>

        {/* Found Items (Right Side) */}
        <div style={columnStyle}>
          <h2 style={{ color: "#5cb85c" }}>Found Items</h2>
          {entries.filter((entry) => entry.type === "Found").length > 0 ? (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thTdStyle, ...thStyle }}>Document</th>
                  <th style={{ ...thTdStyle, ...thStyle }}>Name</th>
                  <th style={{ ...thTdStyle, ...thStyle }}>Location</th>
                  <th style={{ ...thTdStyle, ...thStyle }}>Contact</th>
                  <th style={{ ...thTdStyle, ...thStyle }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries
                  .filter((entry) => entry.type === "Found")
                  .map((entry) => (
                    <tr key={entry.id}>
                      <td style={thTdStyle}>{entry.document}</td>
                      <td style={thTdStyle}>{entry.name}</td>
                      <td style={thTdStyle}>{entry.location}</td>
                      <td style={thTdStyle}>{entry.contact}</td>
                      <td style={thTdStyle}>
                        <button
                          style={{ background: "#007bff", color: "white", padding: "5px", borderRadius: "5px", border: "none", cursor: "pointer" }}
                          onClick={() => handleViewDetails(entry)}
                        >
                          More Details
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p>No found items available.</p>
          )}
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
                <p><strong>Contact:</strong> {selectedEntry.contact}</p>
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

export default LostFound;
