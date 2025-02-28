import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Home() {
  return (
    <div className="home-container">
      <section className="hero-section py-5 bg-gradient">
        <div className="container">
          <motion.div
            className="col-lg-6 text-center text-lg-start mb-4 mb-lg-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="display-4 fw-bold text-primary mb-3">
              Lost Something Important?
            </h1>
            <p className="lead mb-4">
              Our platform helps reunite people with their lost documents and belongings
              through a secure, private matching system.
            </p>
            <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
              <Link to="/report-lost" className="btn btn-primary btn-lg px-4 py-2 shadow-sm">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Report Lost Item
              </Link>
              <Link to="/report-found" className="btn btn-success btn-lg px-4 py-2 shadow-sm">
                <i className="bi bi-check-circle-fill me-2"></i>
                Report Found Item
              </Link>
              <Link to="/search" className="btn btn-info btn-lg px-4 py-2 shadow-sm text-white">
                <i className="bi bi-search me-2"></i>
                Search Database
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="col-lg-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src="hero-image.svg" alt="Lost and Found" className="img-fluid rounded shadow-lg" />
          </motion.div>
        </div>
      </section>

      <section className="how-it-works py-5">
        <div className="container">
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="display-5 fw-bold text-primary">How It Works</h2>
            <p className="lead">Simple steps to find what you've lost or return what you've found</p>
          </motion.div>
          <motion.div
            className="row g-4 justify-content-center"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 0.2 } }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div className="col-md-4" variants={{ opacity: 0, opacity: 1 }}>
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body text-center p-4">
                  <div className="feature-icon bg-primary bg-gradient text-white rounded-circle mb-3">
                    <i className="bi bi-file-earmark-text fs-2"></i>
                  </div>
                  <h3 className="fw-bold">Report</h3>
                  <p className="card-text">
                    Submit a detailed report about what you've lost or found without revealing sensitive information.
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div className="col-md-4" variants={{ opacity: 0, opacity: 1 }}>
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body text-center p-4">
                  <div className="feature-icon bg-success bg-gradient text-white rounded-circle mb-3">
                    <i className="bi bi-link-45deg fs-2"></i>
                  </div>
                  <h3 className="fw-bold">Match</h3>
                  <p className="card-text">
                    Our system matches lost and found reports based on descriptions, locations, and dates.
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div className="col-md-4" variants={{ opacity: 0, opacity: 1 }}>
              <div className="card h-100 border-0 shadow-sm hover-card">
                <div className="card-body text-center p-4">
                  <div className="feature-icon bg-info bg-gradient text-white rounded-circle mb-3">
                    <i className="bi bi-people fs-2"></i>
                  </div>
                  <h3 className="fw-bold">Reunite</h3>
                  <p className="card-text">
                    Connect securely with the finder/owner through our verified contact system to retrieve your item.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="stats-section py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <motion.div
              className="col-lg-6 mb-4 mb-lg-0"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <img src="stats-image.svg" alt="Success statistics" className="img-fluid rounded shadow" />
            </motion.div>
            <motion.div
              className="col-lg-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="display-6 fw-bold text-primary mb-4">Making a Difference</h2>
              <div className="row g-4">
                <div className="col-6">
                  <div className="stat-card bg-white p-3 rounded shadow-sm text-center">
                    <h3 className="text-primary display-4 fw-bold mb-0">1000+</h3>
                    <p className="mb-0">Items Reported</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="stat-card bg-white p-3 rounded shadow-sm text-center">
                    <h3 className="text-success display-4 fw-bold mb-0">85%</h3>
                    <p className="mb-0">Success Rate</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="stat-card bg-white p-3 rounded shadow-sm text-center">
                    <h3 className="text-info display-4 fw-bold mb-0">24h</h3>
                    <p className="mb-0">Avg. Response Time</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="stat-card bg-white p-3 rounded shadow-sm text-center">
                    <h3 className="text-warning display-4 fw-bold mb-0">5★</h3>
                    <p className="mb-0">User Rating</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="testimonials py-5 bg-primary text-white">
        <div className="container">
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="display-5 fw-bold text-primary">Success Stories</h2>
            <p className="lead">Hear from people who have been reunited with their belongings</p>
          </motion.div>
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="testimonial-slider">
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="avatar bg-primary text-white rounded-circle">RP</div>
                      <div className="ms-3">
                        <h5 className="mb-0">Rahul Patel</h5>
                        <p className="text-muted mb-0">Found passport</p>
                      </div>
                      <div className="ms-auto">
                        <i className="bi bi-quote fs-1 text-primary opacity-25"></i>
                      </div>
                    </div>
                    <p className="mb-0">
                      "I lost my passport at a railway station and was in a panic. Someone found it and registered it here. I was able to get it back within just 24 hours. This service is truly life-saving!"
                    </p>
                  </div>
                </div>
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="avatar bg-success text-white rounded-circle">AS</div>
                      <div className="ms-3">
                        <h5 className="mb-0">Anita Singh</h5>
                        <p className="text-muted mb-0">Lost Aadhaar Card</p>
                      </div>
                      <div className="ms-auto">
                        <i className="bi bi-quote fs-1 text-success opacity-25"></i>
                      </div>
                    </div>
                    <p className="mb-0">
                      "I was worried sick about my lost Aadhaar card. Posted a report here and got matched with someone who found it at a mall. The process was smooth and secure. Highly recommend!"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section py-5 bg-primary text-white">
        <div className="container">
          <motion.div
            className="row align-items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="col-lg-8 text-center text-lg-start">
              <h2 className="display-5 fw-bold mb-3">Ready to Find What You've Lost?</h2>
              <p className="lead mb-4 mb-lg-0">
                Join thousands of people who have successfully recovered their lost items.
              </p>
            </div>
            <div className="col-lg-4 text-center text-lg-end">
              <Link to="/report-lost" className="btn btn-light btn-lg px-4 py-2 me-3">Report Lost</Link>
              <Link to="/search" className="btn btn-outline-light btn-lg px-4 py-2">Search Items</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;
