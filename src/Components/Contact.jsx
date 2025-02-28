import React from "react";

function Contact() {
  return (
    <div className="container mt-4">
      <h1 className="text-center">Contact Us</h1>
      <p className="text-center">Get in touch with us for any inquiries or support.</p>
      <form className="mt-4">
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input type="text" className="form-control" placeholder="Your Name" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" placeholder="Your Email" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Subject</label>
          <input type="text" className="form-control" placeholder="Subject" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Message</label>
          <textarea className="form-control" rows="4" placeholder="Your Message" required></textarea>
        </div>
        <button type="submit" className="btn btn-primary w-100">Send Message</button>
      </form>
    </div>
  );
}

export default Contact;
