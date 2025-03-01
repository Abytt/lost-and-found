import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";

function BloodDonor() {
  const [donors, setDonors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [userName, setUserName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  useEffect(() => {
    fetch("/blood_donors.json") // Fetch from public folder
      .then((response) => response.json())
      .then((data) => setDonors(data))
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filteredDonors = donors.filter(
      (donor) =>
        donor.location.toLowerCase().includes(term) ||
        donor.blood_group.toLowerCase().includes(term)
    );
    setDonors(filteredDonors);
  };

  const handleSelectDonor = (donor) => {
    setSelectedDonor(donor);
  };

  const handleSendEmail = () => {
    if (!selectedDonor || !userName || !mobileNumber) {
      alert("Please select a donor and enter your name & mobile number.");
      return;
    }

    const emailParams = {
      donor_name: selectedDonor.name,
      user_name: userName,
      user_mobile: mobileNumber,
      to_email: selectedDonor.email,
    };

    emailjs
      .send(
        "service_sgxvctt", // EmailJS Service ID
        "template_re98gfa", // EmailJS Template ID
        emailParams,
        "cDnQifYecT7OeAQ5E" // EmailJS Public Key
      )
      .then((response) => {
        console.log("✅ Email sent successfully!", response.status, response.text);
        alert(`Email sent successfully to ${selectedDonor.email}`);
      })
      .catch((error) => {
        console.error("❌ Error sending email:", error);
        alert("Error sending email. Please check console for details.");
      });
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Blood Donor Helper</h1>
      
      {/* Search Input */}
      <input
        type="text"
        className="form-control mb-4"
        placeholder="Search by location or blood group..."
        value={searchTerm}
        onChange={handleSearch}
      />

      <div className="row">
        {/* Donors List (Left) */}
        <div className="col-md-6">
          <ul className="list-group">
            {donors.map((donor) => (
              <li
                key={donor.id}
                className={`list-group-item d-flex justify-content-between align-items-center ${selectedDonor?.id === donor.id ? 'active' : ''}`}
                onClick={() => handleSelectDonor(donor)}
                style={{ cursor: "pointer", transition: "0.3s" }}
              >
                <div>
                  <strong>{donor.name}</strong>
                  <div style={{ fontSize: "0.9rem", color: "#555" }}>
                    {donor.location} | {donor.blood_group}
                  </div>
                </div>
                <div>
                  <button className="btn btn-outline-primary btn-sm">View</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Selected Donor (Middle) */}
        <div className="col-md-6">
          {selectedDonor && (
            <div className="card p-3 shadow-lg" style={{ borderRadius: "10px" }}>
              <h2 className="text-center">{selectedDonor.name}</h2>
              <p><strong>Location:</strong> {selectedDonor.location}</p>
              <p><strong>Blood Group:</strong> {selectedDonor.blood_group}</p>
              <p><strong>Email:</strong> {selectedDonor.email}</p>
              <p><strong>Phone:</strong> {selectedDonor.phone}</p>
              
              {/* User Name Input */}
              <div className="mb-3">
                <label htmlFor="userName" className="form-label">Your Name:</label>
                <input
                  type="text"
                  className="form-control"
                  id="userName"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              {/* Mobile Number Input */}
              <div className="mb-3">
                <label htmlFor="mobileNumber" className="form-label">Your Mobile Number:</label>
                <input
                  type="text"
                  className="form-control"
                  id="mobileNumber"
                  placeholder="Enter your mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </div>

              {/* Send Email Button */}
              <button className="btn btn-primary w-100" onClick={handleSendEmail}>
                Send Email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BloodDonor;
