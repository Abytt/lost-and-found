import React from "react";

function Features() {
  return (
    <div className="container">
      <h1 className="text-center mb-5">Our Features</h1>
      <div className="row mb-5">
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow-custom">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-speedometer2 text-primary" style={{ fontSize: "2.5rem" }}></i>
              </div>
              <h4 className="card-title">High Performance</h4>
              <p className="card-text">Optimized code for maximum speed and efficiency to deliver the best user experience.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow-custom">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-phone text-primary" style={{ fontSize: "2.5rem" }}></i>
              </div>
              <h4 className="card-title">Responsive Design</h4>
              <p className="card-text">Fully responsive layouts that work perfectly on all devices and screen sizes.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow-custom">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-shield-check text-primary" style={{ fontSize: "2.5rem" }}></i>
              </div>
              <h4 className="card-title">Enhanced Security</h4>
              <p className="card-text">State-of-the-art security measures to protect your data and privacy.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="row mb-5">
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow-custom">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-graph-up text-primary" style={{ fontSize: "2.5rem" }}></i>
              </div>
              <h4 className="card-title">Analytics</h4>
              <p className="card-text">Comprehensive analytics tools to track performance and user engagement.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow-custom">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-cloud-upload text-primary" style={{ fontSize: "2.5rem" }}></i>
              </div>
              <h4 className="card-title">Cloud Integration</h4>
              <p className="card-text">Seamless integration with popular cloud services for data storage and synchronization.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 border-0 shadow-custom">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-chat-dots text-primary" style={{ fontSize: "2.5rem" }}></i>
              </div>
              <h4 className="card-title">24/7 Support</h4>
              <p className="card-text">Round-the-clock customer support to assist you whenever you need help.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 mb-4 bg-primary-light rounded-custom">
        <div className="container-fluid py-5 text-center">
          <h2 className="display-5 fw-bold">Ready to Get Started?</h2>
          <p className="fs-4">Join thousands of satisfied users who have transformed their experience with our features.</p>
          <button className="btn btn-primary btn-lg">Sign Up Today</button>
        </div>
      </div>
    </div>
  );
}

export default Features;
