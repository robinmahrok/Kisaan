import React, { useCallback, useMemo } from "react";
import "./footer.css";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFacebookF, 
  faTwitter, 
  faLinkedinIn, 
  faInstagram
} from "@fortawesome/free-brands-svg-icons";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

// Constants for better maintainability
const SOCIAL_LINKS = [
  { 
    icon: faFacebookF, 
    href: "https://facebook.com/kisaan", 
    label: "Facebook"
  },
  { 
    icon: faTwitter, 
    href: "https://twitter.com/kisaan", 
    label: "Twitter"
  },
  { 
    icon: faLinkedinIn, 
    href: "https://linkedin.com/company/kisaan", 
    label: "LinkedIn"
  },
  { 
    icon: faInstagram, 
    href: "https://instagram.com/kisaan", 
    label: "Instagram"
  }
];



// Custom hook for navigation
const useFooterNavigation = () => {
  const history = useHistory();
  
  const navigateTo = useCallback((path) => {
    history.push(path);
  }, [history]);
  
  return { navigateTo };
};

export default function Footer() {
  const { navigateTo } = useFooterNavigation();
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const handleNavigation = useCallback((path) => {
    navigateTo(path);
  }, [navigateTo]);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Left side - Brand and message */}
          <div className="footer-left">
            <div className="footer-brand">
              <span className="brand-icon">🌾</span>
              <span className="brand-name">Kisaan</span>
            </div>
            
            <div className="footer-message">
              Empowering farmers, connecting communities
            </div>
          </div>

          {/* Right side - Social and copyright */}
          <div className="footer-right">
            <div className="social-links">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="social-link"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={social.icon} />
                </a>
              ))}
            </div>
            
            <div className="copyright">
              © {currentYear} Kisaan. Made with <FontAwesomeIcon icon={faHeart} className="heart-icon" /> for farmers.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
