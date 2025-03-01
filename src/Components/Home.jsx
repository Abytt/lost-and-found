import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Home() {
  return (
    <div className="home-container">
      {/* Blood Drop Animation - Fixed Position */}
      <Link to="/blood-donor" className="blood-drop-link" style={{
        position: "fixed",
        top: "80px", // Position below navbar
        right: "20px",
        zIndex: "999",
        cursor: "pointer",
        textDecoration: "none"
      }}>
        <motion.div
          className="blood-drop-container"
          initial={{ scale: 1 }}
          animate={{
            scale: [1, 1.1, 1],
            y: [0, 5, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
          whileHover={{ scale: 1.2 }}
        >
          <div className="blood-drop" style={{
            width: "40px",
            height: "60px",
            background: "linear-gradient(135deg, #ff0000, #b30000)",
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            position: "relative",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}>
            <motion.div
              className="pulse"
              initial={{ opacity: 0.5, scale: 0.8 }}
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1, 0.8]
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              }}
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.4)"
              }}
            />
          </div>
          <motion.div
            className="blood-drop-text"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={{
              marginTop: "5px",
              background: "#b30000",
              color: "white",
              padding: "5px 10px",
              borderRadius: "15px",
              fontSize: "12px",
              fontWeight: "bold",
              textAlign: "center",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}
          >
            Donate Blood. Save Lives
          </motion.div>

          {/* Ripple Effect */}
          <motion.div
            className="ripple"
            initial={{ opacity: 0.7, scale: 1 }}
            animate={{
              opacity: 0,
              scale: 1.5
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeOut"
            }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "2px solid #ff0000",
              zIndex: "-1"
            }}
          />
        </motion.div>
      </Link>

      {/* Hero Section with Improved Gradient and Layout */}
      <section className="hero-section py-5" style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        borderBottom: "1px solid rgba(0,0,0,0.05)"
      }}>
        <div className="container">
          <div className="row align-items-center">
            <motion.div
              className="col-lg-6 text-center text-lg-start mb-5 mb-lg-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="badge bg-primary text-white px-3 py-2 mb-3 rounded-pill">Your Trusted Recovery Partner</span>
              <h1 className="display-4 fw-bold mb-3" style={{
                background: "linear-gradient(90deg, #0d6efd, #0dcaf0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                Lost Something Important?
              </h1>
              <p className="lead mb-4 text-secondary">
                Our platform helps reunite people with their lost documents and belongings
                through a secure, private matching system that just works.
              </p>
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                <Link to="/report-lost" className="btn btn-primary btn-lg px-4 py-2" style={{
                  borderRadius: "30px",
                  boxShadow: "0 4px 14px rgba(13, 110, 253, 0.3)",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }} onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 18px rgba(13, 110, 253, 0.4)";
                }} onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(13, 110, 253, 0.3)";
                }}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Report Lost Item
                </Link>
                <Link to="/report-found" className="btn btn-success btn-lg px-4 py-2" style={{
                  borderRadius: "30px",
                  boxShadow: "0 4px 14px rgba(25, 135, 84, 0.3)",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }} onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 18px rgba(25, 135, 84, 0.4)";
                }} onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(25, 135, 84, 0.3)";
                }}>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Report Found Item
                </Link>
                <Link to="/search" className="btn btn-info btn-lg px-4 py-2 text-white" style={{
                  borderRadius: "30px",
                  boxShadow: "0 4px 14px rgba(13, 202, 240, 0.3)",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }} onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 18px rgba(13, 202, 240, 0.4)";
                }} onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(13, 202, 240, 0.3)";
                }}>
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
              {/* <div style={{
                padding: "20px",
                background: "white",
                borderRadius: "20px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                transform: "rotate(2deg)"
              }}>
                <img src="hero-image.svg" alt="Lost and Found" className="img-fluid rounded" style={{
                  transform: "rotate(-2deg)",
                  transition: "transform 0.3s ease"
                }} />
              </div> */}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section with Enhanced Cards */}
      <section className="how-it-works py-5" style={{ background: "#ffffff" }}>
        <div className="container">
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="badge bg-light text-primary px-3 py-2 mb-3 rounded-pill">Simple Process</span>
            <h2 className="display-5 fw-bold mb-2" style={{
              background: "linear-gradient(90deg, #0d6efd, #0dcaf0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>How It Works</h2>
            <div className="mx-auto" style={{ maxWidth: "600px" }}>
              <p className="lead text-secondary">Simple steps to find what you've lost or return what you've found</p>
            </div>
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
            <motion.div className="col-md-4" variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}>
              <div className="card h-100 border-0" style={{
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                transition: "transform 0.3s, box-shadow 0.3s",
                overflow: "hidden"
              }} onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.1)";
              }} onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.05)";
              }}>
                <div className="card-body text-center p-4">
                  <div style={{
                    width: "80px",
                    height: "80px",
                    margin: "0 auto 20px",
                    background: "linear-gradient(135deg, #0d6efd, #0a58ca)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <i className="bi bi-file-earmark-text fs-1 text-white"></i>
                  </div>
                  <h3 className="fw-bold mb-3">Report</h3>
                  <p className="card-text text-secondary">
                    Submit a detailed report about what you've lost or found without revealing sensitive information.
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div className="col-md-4" variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}>
              <div className="card h-100 border-0" style={{
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                transition: "transform 0.3s, box-shadow 0.3s",
                overflow: "hidden"
              }} onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.1)";
              }} onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.05)";
              }}>
                <div className="card-body text-center p-4">
                  <div style={{
                    width: "80px",
                    height: "80px",
                    margin: "0 auto 20px",
                    background: "linear-gradient(135deg, #198754, #157347)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <i className="bi bi-link-45deg fs-1 text-white"></i>
                  </div>
                  <h3 className="fw-bold mb-3">Match</h3>
                  <p className="card-text text-secondary">
                    Our system matches lost and found reports based on descriptions, locations, and dates.
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div className="col-md-4" variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}>
              <div className="card h-100 border-0" style={{
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                transition: "transform 0.3s, box-shadow 0.3s",
                overflow: "hidden"
              }} onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.1)";
              }} onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.05)";
              }}>
                <div className="card-body text-center p-4">
                  <div style={{
                    width: "80px",
                    height: "80px",
                    margin: "0 auto 20px",
                    background: "linear-gradient(135deg, #0dcaf0, #0aa2c0)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <i className="bi bi-people fs-1 text-white"></i>
                  </div>
                  <h3 className="fw-bold mb-3">Reunite</h3>
                  <p className="card-text text-secondary">
                    Connect securely with the finder/owner through our verified contact system to retrieve your item.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section with Improved Layout and Styling */}
      <section className="stats-section py-5" style={{ background: "#f8f9fa" }}>
        <div className="container">
          <div className="row align-items-center">
            <motion.div
              className="col-lg-6 mb-4 mb-lg-0"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div style={{
                padding: "20px",
                background: "white",
                borderRadius: "20px",
                boxShadow: "0 15px 30px rgba(0,0,0,0.1)"
              }}>
                <img src="stats-image.svg" alt="Success statistics" className="img-fluid rounded" />
              </div>
            </motion.div>
            <motion.div
              className="col-lg-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="badge bg-light text-primary px-3 py-2 mb-3 rounded-pill">Our Impact</span>
              <h2 className="display-6 fw-bold mb-4" style={{
                background: "linear-gradient(90deg, #0d6efd, #0dcaf0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>Making a Difference</h2>

              <div className="row g-4">
                <div className="col-6">
                  <div className="p-4 rounded-4" style={{
                    background: "white",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                    transition: "transform 0.3s",
                    border: "1px solid rgba(0,0,0,0.05)"
                  }} onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                  }} onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}>
                    <h3 className="display-4 fw-bold mb-0" style={{ color: "#0d6efd" }}>1000+</h3>
                    <p className="text-secondary mb-0">Items Reported</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-4 rounded-4" style={{
                    background: "white",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                    transition: "transform 0.3s",
                    border: "1px solid rgba(0,0,0,0.05)"
                  }} onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                  }} onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}>
                    <h3 className="display-4 fw-bold mb-0" style={{ color: "#198754" }}>85%</h3>
                    <p className="text-secondary mb-0">Success Rate</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-4 rounded-4" style={{
                    background: "white",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                    transition: "transform 0.3s",
                    border: "1px solid rgba(0,0,0,0.05)"
                  }} onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                  }} onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}>
                    <h3 className="display-4 fw-bold mb-0" style={{ color: "#0dcaf0" }}>24h</h3>
                    <p className="text-secondary mb-0">Avg. Response Time</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-4 rounded-4" style={{
                    background: "white",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                    transition: "transform 0.3s",
                    border: "1px solid rgba(0,0,0,0.05)"
                  }} onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                  }} onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}>
                    <h3 className="display-4 fw-bold mb-0" style={{ color: "#ffc107" }}>5★</h3>
                    <p className="text-secondary mb-0">User Rating</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section with Improved Card Design */}
      <section className="testimonials py-5" style={{ background: "white" }}>
        <div className="container">
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="badge bg-light text-primary px-3 py-2 mb-3 rounded-pill">Real Stories</span>
            <h2 className="display-5 fw-bold mb-2" style={{
              background: "linear-gradient(90deg, #0d6efd, #0dcaf0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>Success Stories</h2>
            <div className="mx-auto" style={{ maxWidth: "600px" }}>
              <p className="lead text-secondary">Hear from people who have been reunited with their belongings</p>
            </div>
          </motion.div>
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="testimonial-slider">
                <div className="row g-4">
                  <motion.div
                    className="col-md-6"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="card border-0 h-100" style={{
                      borderRadius: "20px",
                      boxShadow: "0 10px 30px rgba(13, 110, 253, 0.1)",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      background: "linear-gradient(to bottom right, #ffffff, #f8f9fa)"
                    }} onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-10px)";
                      e.currentTarget.style.boxShadow = "0 15px 40px rgba(13, 110, 253, 0.15)";
                    }} onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 10px 30px rgba(13, 110, 253, 0.1)";
                    }}>
                      <div className="card-body p-4">
                        <div style={{ fontSize: "24px", color: "#0d6efd", marginBottom: "15px" }}>
                          <i className="bi bi-quote"></i>
                        </div>
                        <p className="mb-4 text-secondary" style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
                          "I lost my passport at a railway station and was in a panic. Someone found it and registered it here. I was able to get it back within just 24 hours. This service is truly life-saving!"
                        </p>
                        <div className="d-flex align-items-center">
                          <div style={{
                            width: "50px",
                            height: "50px",
                            background: "linear-gradient(135deg, #0d6efd, #0a58ca)",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold"
                          }}>RP</div>
                          <div className="ms-3">
                            <h5 className="mb-0 fw-bold">Rahul Patel</h5>
                            <p className="text-primary mb-0">Found Passport</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    className="col-md-6"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="card border-0 h-100" style={{
                      borderRadius: "20px",
                      boxShadow: "0 10px 30px rgba(25, 135, 84, 0.1)",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      background: "linear-gradient(to bottom right, #ffffff, #f8f9fa)"
                    }} onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-10px)";
                      e.currentTarget.style.boxShadow = "0 15px 40px rgba(25, 135, 84, 0.15)";
                    }} onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 10px 30px rgba(25, 135, 84, 0.1)";
                    }}>
                      <div className="card-body p-4">
                        <div style={{ fontSize: "24px", color: "#198754", marginBottom: "15px" }}>
                          <i className="bi bi-quote"></i>
                        </div>
                        <p className="mb-4 text-secondary" style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
                          "I was worried sick about my lost Aadhaar card. Posted a report here and got matched with someone who found it at a mall. The process was smooth and secure. Highly recommend!"
                        </p>
                        <div className="d-flex align-items-center">
                          <div style={{
                            width: "50px",
                            height: "50px",
                            background: "linear-gradient(135deg, #198754, #157347)",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold"
                          }}>AS</div>
                          <div className="ms-3">
                            <h5 className="mb-0 fw-bold">Anita Singh</h5>
                            <p className="text-success mb-0">Lost Aadhaar Card</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Improved Design */}
      <section className="cta-section py-5" style={{
        background: "linear-gradient(135deg, #0d6efd, #0dcaf0)",
        borderRadius: "0",
        position: "relative",
        overflow: "hidden"
      }}>
        <div className="container position-relative" style={{ zIndex: "2" }}>
          <motion.div
            className="row align-items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="col-lg-8 text-center text-lg-start text-white">
              <h2 className="display-5 fw-bold mb-3">Ready to Find What You've Lost?</h2>
              <p className="lead mb-4 mb-lg-0 opacity-90">
                Join thousands of people who have successfully recovered their lost items.
              </p>
            </div>
            <div className="col-lg-4 text-center text-lg-end">
              <Link to="/report-lost" className="btn btn-light btn-lg px-4 py-2 me-3" style={{
                borderRadius: "30px",
                fontWeight: "600",
                boxShadow: "0 4px 14px rgba(255,255,255,0.2)",
                transition: "transform 0.2s"
              }} onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
              }} onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}>Report Lost</Link>
              <Link to="/search" className="btn btn-outline-light btn-lg px-4 py-2" style={{
                borderRadius: "30px",
                fontWeight: "600",
                transition: "transform 0.2s"
              }} onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
              }} onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}>Search Items</Link>
            </div>
          </motion.div>
        </div>
        {/* Abstract Background Elements */}
        <div style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          top: "-150px",
          left: "-150px"
        }}></div>
        <div style={{
          position: "absolute",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          bottom: "-100px",
          right: "10%"
        }}></div>
      </section>
    </div>
  );
}

export default Home;
