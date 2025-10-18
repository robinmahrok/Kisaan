import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import "./header.css";
import { useHistory } from "react-router-dom";
import { Token } from "../../utils/utils";
import { useTranslate } from "../../hooks/useTranslate";
import { getAuthToken, removeAuthToken } from "../../utils/cookies";

// Custom hook for user authentication
const useUserAuth = () => {
  const history = useHistory();

  const getUserFromToken = useCallback(() => {
    const token = getAuthToken(); // Get token from cookies
    if (!token) {
      history.push("/");
      return null;
    }

    try {
      const nameEmail = Token(token);
      const [name] = nameEmail.split(",");
      return { name };
    } catch (error) {
      console.error("Error parsing token:", error);
      history.push("/");
      return null;
    }
  }, [history]);

  return { getUserFromToken };
};

// Custom hook for navigation
const useNavigation = () => {
  const history = useHistory();

  const navigateTo = useCallback(
    (path) => {
      history.push(path);
    },
    [history]
  );

  const handleLogout = useCallback(() => {
    removeAuthToken(); // Remove token from cookies
    history.push("/");
  }, [history]);

  return { navigateTo, handleLogout };
};

export default function Header() {
  const [user, setUser] = useState({ name: "" });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Refs for click outside detection
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const { getUserFromToken } = useUserAuth();
  const { navigateTo, handleLogout } = useNavigation();
  const { t } = useTranslate();

  // Navigation items with translations
  const navigationItems = useMemo(
    () => [
      { path: "/home", label: t("Home") },
      { path: "/allAccounts", label: t("My Items") },
      { path: "/request", label: t("Requests") },
      { path: "/aboutUs", label: t("About Us") },
      { path: "/ContactUs", label: t("Contact Us") },
    ],
    [t]
  );

  useEffect(() => {
    const userData = getUserFromToken();
    if (userData) {
      setUser(userData);
    }
  }, [getUserFromToken]);

  useEffect(() => {
    // Set active item based on current path
    const currentPath = window.location.pathname;
    setActiveItem(currentPath);
  }, []);

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user menu if clicking outside
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }

      // Close mobile menu if clicking outside (but not on the toggle button)
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        const mobileToggle = document.querySelector(".mobile-menu-toggle");
        if (mobileToggle && !mobileToggle.contains(event.target)) {
          setIsMenuOpen(false);
        }
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Handle escape key to close dropdowns
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("mobile-menu-open");
    } else {
      document.body.classList.remove("mobile-menu-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("mobile-menu-open");
    };
  }, [isMenuOpen]);

  const handleNavigation = useCallback(
    (path) => {
      setActiveItem(path);
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
      navigateTo(path);
    },
    [navigateTo]
  );

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
    // Close user menu when opening mobile menu
    if (!isMenuOpen) {
      setIsUserMenuOpen(false);
    }
  }, [isMenuOpen]);

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
    // Close mobile menu when opening user menu
    if (!isUserMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isUserMenuOpen]);

  const userMenuItems = useMemo(
    () => [{ label: t("Log Out"), action: handleLogout }],
    [t, handleLogout]
  );

  return (
    <header className="header">
      <div className="header-container">
        {/* Mobile Menu Toggle - Left Side */}
        <button
          className="mobile-menu-toggle"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label="Toggle mobile menu"
        >
          <div className={`hamburger ${isMenuOpen ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {/* Logo/Brand - Center */}
        <div className="header-brand" onClick={() => handleNavigation("/home")}>
          <img src="/khetihat.png" alt="Khetihat" className="brand-icon" />
          <h1 className="brand-text">Khetihat</h1>
        </div>

        {/* Desktop Navigation - Hidden on mobile, shown on desktop */}
        <nav className="desktop-nav">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${activeItem === item.path ? "active" : ""}`}
              onClick={() => handleNavigation(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Menu - Right Side */}
        <div className="user-menu" ref={userMenuRef}>
          <button
            className="user-menu-trigger"
            onClick={toggleUserMenu}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{user.name}</span>
            <svg
              className={`chevron ${isUserMenuOpen ? "open" : ""}`}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isUserMenuOpen && !isMenuOpen && (
            <div className="user-menu-dropdown">
              {userMenuItems.map((item, index) => (
                <button
                  key={index}
                  className="user-menu-item"
                  onClick={() => {
                    item.action();
                    setIsUserMenuOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`mobile-nav ${isMenuOpen ? "open" : ""}`}
        ref={mobileMenuRef}
      >
        <div className="mobile-nav-content">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              className={`mobile-nav-item ${
                activeItem === item.path ? "active" : ""
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMenuOpen(false)} />
      )}
    </header>
  );
}
