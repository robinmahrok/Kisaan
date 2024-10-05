import React from "react";
import "./footer.css";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faTwitter, faLinkedinIn, faInstagram } from "@fortawesome/free-brands-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Footer() {
  let history = useHistory();

  const handleOnChangeContact = (e) => {
    e.preventDefault();
    history.push("/ContactUs");
  };

  const handleOnChangeAbout = (e) => {
    e.preventDefault();
    history.push("/aboutUs");
  };

  const handleOnChangeHome = (e) => {
    e.preventDefault();
    history.push("/home");
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <h1 className="footer-title">Kisaan</h1>
          <p className="footer-description">Your trusted platform for all agricultural needs.</p>
          <div className="social-icons">
            <a href="facebook.com" aria-label="Facebook"><FontAwesomeIcon icon={faFacebookF} /></a>
            <a href="x.com" aria-label="Twitter"><FontAwesomeIcon icon={faTwitter} /></a>
            <a href="linkedin.com" aria-label="LinkedIn"><FontAwesomeIcon icon={faLinkedinIn} /></a>
            <a href="instagram.com" aria-label="Instagram"><FontAwesomeIcon icon={faInstagram} /></a>
          </div>
        </div>
        <div className="footer-right">
          <nav className="footer-nav">
            <span className="footer-link" onClick={handleOnChangeHome}>Home</span>
            <span className="footer-link" onClick={handleOnChangeAbout}>About Us</span>
            <span className="footer-link" onClick={handleOnChangeContact}>Contact Us</span>
          </nav>
          <p className="footer-copy">Kisaan &copy; 2022</p>
        </div>
      </div>
    </footer>
  );
}
