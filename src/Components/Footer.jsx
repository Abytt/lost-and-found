import React from "react";

function Footer() {
  return (
    <footer className="bg-dark text-light text-center py-1 mt-auto footer-compact">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-1 mb-md-0">
            <h6 className="extra-small">MyWebsite</h6>
            <p className="tiny mb-0">Creating innovative solutions since 2025</p>
          </div>
          <div className="col-md-4 mb-1 mb-md-0">
            <h6 className="extra-small">Quick Links</h6>
            <ul className="list-unstyled tiny mb-0">
              <li><a href="/" className="text-white-50">Home</a></li>
              <li><a href="/about" className="text-white-50">About</a></li>
              <li><a href="/contact" className="text-white-50">Contact</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6 className="extra-small">Connect With Us</h6>
            <div className="d-flex justify-content-center">
              <a href="#" className="text-white mx-1"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-white mx-1"><i className="bi bi-twitter"></i></a>
              <a href="#" className="text-white mx-1"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-white mx-1"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
        </div>
        <p className="mb-0 tiny">&copy; 2025 MyWebsite. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
