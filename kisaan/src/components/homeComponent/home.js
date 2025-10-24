import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./home.css";
import { Spinner } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import Header from "../headerComponent";
import Footer from "../footerComponent";
import { Token } from "../../utils/utils";
import { useTranslate } from "../../hooks/useTranslate";
import { getAuthToken } from "../../utils/cookies";
// Constants for better maintainability
const ROLE_TYPES = {
  SELLER: "seller",
  BUYER: "buyer",
};

// Custom hook for user authentication
const useUserAuth = () => {
  const getUserFromToken = useCallback(() => {
    const token = getAuthToken(); // Get token from cookies
    if (!token) {
      return null; // Return null instead of redirecting
    }

    try {
      const nameEmail = Token(token);
      const [name, userId] = nameEmail.split(",");
      return { name, userId };
    } catch (error) {
      console.error("Error parsing token:", error);
      return null;
    }
  }, []);

  return { getUserFromToken };
};

// Custom hook for role navigation
const useRoleNavigation = () => {
  const history = useHistory();
  const [loadingRole, setLoadingRole] = useState(null);

  const navigateToRole = useCallback(
    (role) => {
      setLoadingRole(role);

      // Add a small delay for better UX
      setTimeout(() => {
        history.push(`/${role}`);
      }, 500);
    },
    [history]
  );

  const isRoleLoading = useCallback(
    (role) => {
      return loadingRole === role;
    },
    [loadingRole]
  );

  const isAnyLoading = loadingRole !== null;

  return { navigateToRole, isRoleLoading, isAnyLoading };
};

export default function Home() {
  const [user, setUser] = useState({ name: "", email: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { getUserFromToken } = useUserAuth();
  const { navigateToRole, isRoleLoading, isAnyLoading } = useRoleNavigation();
  const { t } = useTranslate();

  useEffect(() => {
    const userData = getUserFromToken();
    if (userData) {
      setUser({
        name: userData.name,
        email: userData.userId,
      });
      setIsAuthenticated(true);
    } else {
      setUser({
        name: "Guest",
        email: "",
      });
      setIsAuthenticated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleSelection = useCallback(
    (e, role) => {
      e.preventDefault();
      navigateToRole(role);
    },
    [navigateToRole]
  );

  const roleButtons = useMemo(
    () => [
      {
        type: ROLE_TYPES.SELLER,
        label: "Seller",
        description: "Sell your agricultural products",
        icon: "🌾",
        bgColor: "bg-green-600 hover:bg-green-700",
        textColor: "text-white",
      },
      {
        type: ROLE_TYPES.BUYER,
        label: "Buyer",
        description: "Buy fresh agricultural products",
        icon: "🛒",
        bgColor: "bg-blue-600 hover:bg-blue-700",
        textColor: "text-white",
      },
    ],
    []
  );

  return (
    <div className="home-container">
      <Header />

      <main className="home-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-card">
            <div className="welcome-header">
              <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
              <div className="welcome-text">
                <h1 className="welcome-title">
                  {t("Welcome")},{" "}
                  <span className="name-highlight">{user.name}</span>!
                </h1>
                {isAuthenticated && user.email && (
                  <p className="welcome-subtitle">{user.email}</p>
                )}
                {!isAuthenticated && (
                  <p className="welcome-subtitle">
                    {t("Please login to access all features")}
                  </p>
                )}
              </div>
            </div>

            <div className="welcome-description">
              <p>
                {isAuthenticated
                  ? t(
                      "Choose your role to continue with Khetihat - connecting farmers and buyers for a better agricultural marketplace."
                    )
                  : t(
                      "Browse available products or login to sell your agricultural products."
                    )}
              </p>
            </div>
          </div>
        </div>

        {/* Role Selection Section */}
        <div className="role-selection-section">
          <div className="role-selection-container">
            <h2 className="section-title">{t("Select Your Role")}</h2>
            <p className="section-subtitle">
              {t("Choose how you'd like to participate in our marketplace")}
            </p>

            <div className="role-buttons-container">
              {roleButtons.map((role) => {
                const isCurrentRoleLoading = isRoleLoading(role.type);

                return (
                  <button
                    key={role.type}
                    className={`role-button ${role.bgColor} ${role.textColor} ${
                      isCurrentRoleLoading
                        ? "opacity-75 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={(e) => handleRoleSelection(e, role.type)}
                    disabled={isCurrentRoleLoading}
                  >
                    <div className="role-button-content">
                      <div className="role-icon">{role.icon}</div>
                      <div className="role-info">
                        <h3 className="role-label">
                          {isCurrentRoleLoading ? (
                            <>
                              {t(role.label)}
                              <Spinner
                                animation="border"
                                size="sm"
                                className="ml-2 inline-block"
                              />
                            </>
                          ) : (
                            t(role.label)
                          )}
                        </h3>
                        <p className="role-description">
                          {t(role.description)}
                        </p>
                      </div>
                    </div>

                    <div className="role-arrow">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
