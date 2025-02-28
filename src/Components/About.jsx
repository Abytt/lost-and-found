import React from "react";

function About() {
  return (
    <div className="container py-5 mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-body p-4 p-md-5">
              <h1 className="text-center mb-4">About Lost & Found</h1>
              <div className="mb-5">
                <h4 className="border-bottom pb-2 text-primary">Our Mission</h4>
                <p className="lead">
                  We aim to simplify the process of returning lost government identification documents to their rightful owners through a secure and privacy-focused platform.
                </p>
                <p>
                  Our platform is designed to help people report and find lost documents securely. We ensure privacy and security in matching lost and found documents, reducing the hassle of reissuing important government IDs.
                </p>
              </div>
              <div className="mb-5">
                <h4 className="border-bottom pb-2 text-primary">Why Use Our Service?</h4>
                <div className="row g-4 mt-2">
                  <div className="col-md-6">
                    <div className="d-flex">
                      <div className="flex-shrink-0">
                        <i className="bi bi-shield-lock text-primary fs-4"></i>
                      </div>
                      <div className="ms-3">
                        <h5>Enhanced Security</h5>
                        <p>Document details are encrypted and only shared after proper verification</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex">
                      <div className="flex-shrink-0">
                        <i className="bi bi-people text-primary fs-4"></i>
                      </div>
                      <div className="ms-3">
                        <h5>Community-Driven</h5>
                        <p>Leveraging community support to help reunite people with their documents</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex">
                      <div className="flex-shrink-0">
                        <i className="bi bi-check2-circle text-primary fs-4"></i>
                      </div>
                      <div className="ms-3">
                        <h5>Simple Verification</h5>
                        <p>OTP and multi-factor authentication to prevent fraudulent claims</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex">
                      <div className="flex-shrink-0">
                        <i className="bi bi-signpost text-primary fs-4"></i>
                      </div>
                      <div className="ms-3">
                        <h5>Guidance for Reissue</h5>
                        <p>Resources and links to official portals for document reissuance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-5">
                <h4 className="border-bottom pb-2 text-primary">How It Works</h4>
                <div className="row mt-3">
                  <div className="col-md-3 text-center mb-3 mb-md-0">
                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "80px", height: "80px" }}>
                      <i className="bi bi-file-earmark-text text-primary fs-1"></i>
                    </div>
                    <h5>Report</h5>
                    <p className="small">Report lost or found documents</p>
                  </div>
                  <div className="col-md-3 text-center mb-3 mb-md-0">
                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "80px", height: "80px" }}>
                      <i className="bi bi-search text-primary fs-1"></i>
                    </div>
                    <h5>Match</h5>
                    <p className="small">Our system matches documents</p>
                  </div>
                  <div className="col-md-3 text-center mb-3 mb-md-0">
                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "80px", height: "80px" }}>
                      <i className="bi bi-shield-check text-primary fs-1"></i>
                    </div>
                    <h5>Verify</h5>
                    <p className="small">Secure verification process</p>
                  </div>
                  <div className="col-md-3 text-center">
                    <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "80px", height: "80px" }}>
                      <i className="bi bi-arrow-repeat text-primary fs-1"></i>
                    </div>
                    <h5>Return</h5>
                    <p className="small">Document returned to owner</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="border-bottom pb-2 text-primary">Our Team</h4>
                <p>
                  We are a team of passionate individuals who believe in the power of technology to solve everyday problems. Our diverse team includes security experts, UX designers, and developers committed to creating a safe platform for document recovery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
