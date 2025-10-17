import React, { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { baseUrl } from "../../baseUrl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { mobileValidator, emailValidator } from "../../utils/utils";
import "./signup.css";
import { useHistory } from "react-router";
import Footer from "../footerComponent";
import { useTranslate } from "../../hooks/useTranslate";

// Constants for better maintainability
const SIGNUP_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

const ERROR_MESSAGES = {
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_MOBILE: "Please enter a valid 10-digit contact number",
  EMPTY_NAME: "Name is required",
  EMPTY_EMAIL: "Email is required",
  EMPTY_CONTACT: "Contact number is required",
  EMPTY_PASSWORD: "Password is required",
  EMPTY_CONFIRM_PASSWORD: "Please confirm your password",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters long",
  PASSWORD_MISMATCH: "Password and confirm password should be equal",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  GENERIC_ERROR: "An error occurred. Please try again.",
};

// Custom hook for form validation
const useFormValidation = (t) => {
  const validateForm = useCallback(
    (formData) => {
      const { name, email, contact, password, confirmPassword } = formData;
      const errors = {};

      // Name validation
      if (!name.trim()) {
        errors.name = t("Name is required");
      } else if (name.trim().length < 2) {
        errors.name = t("Name must be at least 2 characters long");
      }

      // Email validation
      if (!email.trim()) {
        errors.email = t("Email is required");
      } else if (!emailValidator(email)) {
        errors.email = t("Please enter a valid email address");
      }

      // Contact validation
      if (!contact.trim()) {
        errors.contact = t("Contact number is required");
      } else if (!mobileValidator(contact)) {
        errors.contact = t("Please enter a valid 10-digit contact number");
      }

      // Password validation
      if (!password.trim()) {
        errors.password = t("Password is required");
      } else if (password.length < 6) {
        errors.password = t("Password must be at least 6 characters long");
      }

      // Confirm password validation
      if (!confirmPassword.trim()) {
        errors.confirmPassword = t("Please confirm your password");
      } else if (password !== confirmPassword) {
        errors.confirmPassword = t(
          "Password and confirm password should be equal"
        );
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      };
    },
    [t]
  );

  return { validateForm };
};

// Custom hook for signup API call
const useSignupApi = () => {
  const [signupState, setSignupState] = useState(SIGNUP_STATES.IDLE);
  const [apiError, setApiError] = useState("");

  const signup = useCallback(async (userData) => {
    setSignupState(SIGNUP_STATES.LOADING);
    setApiError("");

    try {
      const response = await axios.post(`${baseUrl}/signup`, userData);

      setSignupState(SIGNUP_STATES.SUCCESS);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      setSignupState(SIGNUP_STATES.ERROR);

      if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else if (error.code === "NETWORK_ERROR" || !error.response) {
        setApiError(ERROR_MESSAGES.NETWORK_ERROR);
      } else {
        setApiError(ERROR_MESSAGES.GENERIC_ERROR);
      }

      return {
        success: false,
        error: error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR,
      };
    }
  }, []);

  const resetSignupState = useCallback(() => {
    setSignupState(SIGNUP_STATES.IDLE);
    setApiError("");
  }, []);

  return {
    signupState,
    apiError,
    signup,
    resetSignupState,
    isLoading: signupState === SIGNUP_STATES.LOADING,
  };
};

export default function SignUp() {
  const { t } = useTranslate();
  const history = useHistory();
  const { validateForm } = useFormValidation(t);
  const { signupState, apiError, signup, resetSignupState, isLoading } =
    useSignupApi();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Refs for form elements
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const contactRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // Focus name input on component mount
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // Clear API errors when form data changes
  useEffect(() => {
    if (apiError) {
      resetSignupState();
    }
  }, [formData, apiError, resetSignupState]);

  // Handle input changes
  const handleInputChange = useCallback(
    (field) => (e) => {
      const value = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear validation errors when user starts typing
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }

      // Clear general errors
      if (validationErrors.general) {
        setValidationErrors((prev) => ({
          ...prev,
          general: "",
        }));
      }
    },
    [validationErrors]
  );

  // Handle password visibility toggle
  const handleTogglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate form only on submit
      const { isValid, errors } = validateForm(formData);
      setValidationErrors(errors);

      if (!isValid) {
        // Focus first field with error
        const fieldOrder = [
          "name",
          "email",
          "contact",
          "password",
          "confirmPassword",
        ];
        const firstErrorField = fieldOrder.find((field) => errors[field]);

        if (firstErrorField) {
          const fieldRefs = {
            name: nameRef,
            email: emailRef,
            contact: contactRef,
            password: passwordRef,
            confirmPassword: confirmPasswordRef,
          };
          fieldRefs[firstErrorField].current?.focus();
        }
        return;
      }

      // Prepare user data
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        contact: formData.contact.trim(),
        password: formData.password,
      };

      // Attempt signup
      const result = await signup(userData);

      if (result.success) {
        const { data } = result;

        if (data.status) {
          // Signup successful
          sessionStorage.setItem("email", formData.email);
          history.push("/otpVerify");
        } else {
          // Signup failed with specific message
          setValidationErrors({ general: data.message });
        }
      }
    },
    [formData, validateForm, signup, history]
  );

  // Handle login redirect
  const handleLoginRedirect = useCallback(() => {
    history.push("/");
  }, [history]);

  // Handle Enter key press for better UX
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !isLoading) {
        handleSubmit(e);
      }
    },
    [handleSubmit, isLoading]
  );

  // Get error message to display
  const displayError = apiError || validationErrors.general;

  // Icons for password visibility
  const eyeIcon = <FontAwesomeIcon icon={faEye} />;
  const eyeSlashIcon = <FontAwesomeIcon icon={faEyeSlash} />;

  return (
    <div className="App">
      <div className="flex-1">
        <header className="App-header-login">
          <div>
            <form className="form" onSubmit={handleSubmit} noValidate>
              <h2>{t("Create Account")}</h2>

              {displayError && (
                <div className="error-message" role="alert" aria-live="polite">
                  {t(`${displayError}`)}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name">
                  {t("Name")}: <span className="required">*</span>
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  className={validationErrors.name ? "error" : ""}
                  id="name"
                  name="name"
                  placeholder={t("Enter your name")}
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  required
                  aria-describedby={
                    validationErrors.name ? "name-error" : undefined
                  }
                  aria-invalid={!!validationErrors.name}
                />
                {validationErrors.name && (
                  <div id="name-error" className="field-error" role="alert">
                    {t(`${validationErrors.name}`)}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  {t("Email")}: <span className="required">*</span>
                </label>
                <input
                  ref={emailRef}
                  type="email"
                  className={validationErrors.email ? "error" : ""}
                  id="email"
                  name="email"
                  placeholder={t("Enter your email address")}
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  required
                  aria-describedby={
                    validationErrors.email ? "email-error" : undefined
                  }
                  aria-invalid={!!validationErrors.email}
                />
                {validationErrors.email && (
                  <div id="email-error" className="field-error" role="alert">
                    {t(`${validationErrors.email}`)}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="contact">
                  {t("Contact No.")}: <span className="required">*</span>
                </label>
                <input
                  ref={contactRef}
                  type="tel"
                  className={validationErrors.contact ? "error" : ""}
                  id="contact"
                  name="contact"
                  placeholder={t("Enter 10 digit contact number")}
                  value={formData.contact}
                  onChange={handleInputChange("contact")}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  maxLength="10"
                  required
                  aria-describedby={
                    validationErrors.contact ? "contact-error" : undefined
                  }
                  aria-invalid={!!validationErrors.contact}
                />
                {validationErrors.contact && (
                  <div id="contact-error" className="field-error" role="alert">
                    {t(`${validationErrors.contact}`)}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  {t("Password")}: <span className="required">*</span>
                </label>
                <div className="password-field">
                  <input
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    className={validationErrors.password ? "error" : ""}
                    id="password"
                    name="password"
                    placeholder={t("Enter password (min 6 characters)")}
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    required
                    aria-describedby={
                      validationErrors.password ? "password-error" : undefined
                    }
                    aria-invalid={!!validationErrors.password}
                  />
                  <i
                    className="eye"
                    onClick={handleTogglePasswordVisibility}
                    role="button"
                    tabIndex={0}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleTogglePasswordVisibility();
                      }
                    }}
                  >
                    {showPassword ? eyeSlashIcon : eyeIcon}
                  </i>
                </div>
                {validationErrors.password && (
                  <div id="password-error" className="field-error" role="alert">
                    {t(`${validationErrors.password}`)}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  {t("Confirm Password")}: <span className="required">*</span>
                </label>
                <input
                  ref={confirmPasswordRef}
                  type={showPassword ? "text" : "password"}
                  className={validationErrors.confirmPassword ? "error" : ""}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder={t("Confirm your password")}
                  value={formData.confirmPassword}
                  onChange={handleInputChange("confirmPassword")}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  required
                  aria-describedby={
                    validationErrors.confirmPassword
                      ? "confirm-password-error"
                      : undefined
                  }
                  aria-invalid={!!validationErrors.confirmPassword}
                />
                {validationErrors.confirmPassword && (
                  <div
                    id="confirm-password-error"
                    className="field-error"
                    role="alert"
                  >
                    {t(`${validationErrors.confirmPassword}`)}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg font-medium text-white text-base transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-green-300 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed opacity-70"
                    : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                } mt-6 sm:mt-8`}
                aria-describedby="signup-button-status"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <span>{t("Creating Account")}</span>
                    <Spinner
                      animation="border"
                      size="sm"
                      role="status"
                      aria-label="Loading"
                      className="ml-2"
                    />
                  </div>
                ) : (
                  t("Create Account")
                )}
              </button>

              {isLoading && (
                <div
                  id="signup-button-status"
                  className="sr-only"
                  aria-live="polite"
                >
                  {t("Creating account, please wait...")}
                </div>
              )}
            </form>

            <p className="login-prompt">
              {t("Already have an account?")} &nbsp;
              <button
                type="button"
                className="login-button"
                onClick={handleLoginRedirect}
                disabled={isLoading}
                tabIndex={isLoading ? -1 : 0}
              >
                {t("Login")}
              </button>
            </p>
          </div>
        </header>
      </div>
      <Footer />
    </div>
  );
}
