import React from "react";
import { useHistory } from "react-router-dom";
import "./authRequiredModal.css";
import { useTranslate } from "../../../hooks/useTranslate";

const AuthRequiredModal = ({ show, onHide, message }) => {
  const history = useHistory();
  const { t } = useTranslate();

  const handleLoginRedirect = () => {
    onHide();
    history.push("/login");
  };

  const handleSignupRedirect = () => {
    onHide();
    history.push("/signUp");
  };
  console.log("show", show);
  if (!show) return null;

  return (
    <div className="auth-modal-overlay" onClick={onHide}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h4 className="auth-modal-title">{t("Authentication Required")}</h4>
          <button className="auth-modal-close" onClick={onHide}>
            X
          </button>
        </div>

        <div className="auth-modal-body">
          <div className="auth-modal-icon">🔒</div>
          <p className="auth-modal-message">
            {message ||
              t(
                "You need to be logged in to access this feature. Please login or create an account to continue."
              )}
          </p>
        </div>

        <div className="auth-modal-footer">
          <button
            className="auth-btn auth-btn-primary"
            onClick={handleSignupRedirect}
          >
            {t("Sign Up")}
          </button>
          <button
            className="auth-btn auth-btn-signup"
            onClick={handleLoginRedirect}
          >
            {t("Login")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredModal;
