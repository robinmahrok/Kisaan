import React, { useState, useEffect } from "react";
import axios from "axios";
import "./forgotPassword.css";
import { Spinner, Alert } from "react-bootstrap";
import { baseUrl } from "../../baseUrl";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

export default function ForgotPassword() {
  const history = useHistory();

  const [email, setEmail] = useState("");
  const [send, setSend] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [verify, setVerify] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading states
  const [loadingSendOtp, setLoadingSendOtp] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);
  const [loadingUpdatePassword, setLoadingUpdatePassword] = useState(false);

  // Message states
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Validation states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Resend functionality
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const mobileValidator = (value) => {
    const regMobile = /^[0][1-9]\d{9}$|^[1-9]\d{9}$/;
    if (value.length === 10 && regMobile.test(value)) {
      return true;
    }
    return false;
  };

  // Password validation
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (send && countdown === 0 && !verify) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, send, verify]);

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setEmailError("");
    setErrorMessage("");

    const isMobileNumber =
      mobileValidator(emailValue) && emailValue.length === 10;
    setIsMobile(isMobileNumber);
    if (emailValue && !validateEmail(emailValue) && !isMobileNumber) {
      setEmailError("Please enter a valid email/mobile number");
    } else setEmailError("");
  };

  const handlePasswordChange = (e) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);
    setPasswordError("");
    setErrorMessage("");

    if (passwordValue && !validatePassword(passwordValue)) {
      setPasswordError(
        "Password must contain at least 6 characters including uppercase, lowercase, number and special character"
      );
    }

    // Revalidate confirm password if it exists
    if (confirmPassword && passwordValue !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else if (confirmPassword) {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPasswordValue = e.target.value;
    setConfirmPassword(confirmPasswordValue);
    setConfirmPasswordError("");
    setErrorMessage("");

    if (confirmPasswordValue && confirmPasswordValue !== password) {
      setConfirmPasswordError("Passwords do not match");
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setEnteredOtp(value);
      setErrorMessage("");
    }
  };

  const sendOTP = async (e) => {
    e.preventDefault();

    // Validation
    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (email && !validateEmail(email) && !isMobile) {
      setEmailError("Please enter a valid email/mobile number");
    }

    setLoadingSendOtp(true);
    setErrorMessage("");
    setSuccessMessage("");
    setEmailError("");

    try {
      const params = { method: isMobile ? "sms" : "email" };
      if (isMobile) {
        params.contact = email;
      } else {
        params.email = email;
      }
      const response = await axios.post(`${baseUrl}/sendOtp`, params);
      setLoadingSendOtp(false);

      if (response.data.status) {
        setSuccessMessage("OTP sent successfully!");
        setSend(true);
        setCanResend(false);
        setCountdown(60); // 60 seconds countdown
      } else {
        setErrorMessage(response.data.message || "Failed to send OTP");
      }
    } catch (err) {
      setLoadingSendOtp(false);
      console.error("Send OTP error:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to send OTP. Please check your internet connection and try again."
      );
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();

    // Validation
    if (!enteredOtp) {
      setErrorMessage("Please enter the OTP");
      return;
    }

    if (enteredOtp.length !== 6) {
      setErrorMessage("OTP must be 6 digits");
      return;
    }

    setLoadingVerifyOtp(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post(`${baseUrl}/verifyOtp`, {
        email,
        otp: parseInt(enteredOtp),
      });

      setLoadingVerifyOtp(false);

      if (response.data.status) {
        setSuccessMessage(
          "OTP verified successfully! Now you can set a new password."
        );
        setVerify(true);
      } else {
        setErrorMessage(
          response.data.message || "Invalid OTP. Please try again."
        );
      }
    } catch (err) {
      setLoadingVerifyOtp(false);
      console.error("Verify OTP error:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to verify OTP. Please check your internet connection and try again."
      );
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError(
        "Password must contain at least 6 characters including uppercase, lowercase, number and special character"
      );
      return;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    setLoadingUpdatePassword(true);
    setErrorMessage("");
    setSuccessMessage("");
    setPasswordError("");
    setConfirmPasswordError("");

    try {
      const response = await axios.post(`${baseUrl}/changePassword`, {
        email,
        password,
      });

      setLoadingUpdatePassword(false);

      if (response.data.status) {
        setSuccessMessage(
          "Password updated successfully! Redirecting to login..."
        );
        setTimeout(() => {
          history.push("/login");
        }, 2000);
      } else {
        setErrorMessage(response.data.message || "Failed to update password");
      }
    } catch (err) {
      setLoadingUpdatePassword(false);
      console.error("Update password error:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to update password. Please check your internet connection and try again."
      );
    }
  };

  const resendOTP = () => {
    setEnteredOtp("");
    setSend(false);
    setCanResend(false);
    setCountdown(0);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const goBack = () => {
    if (verify) {
      setVerify(false);
      setPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setConfirmPasswordError("");
    } else if (send) {
      setSend(false);
      setEnteredOtp("");
      setCanResend(false);
      setCountdown(0);
    } else {
      history.push("/");
    }
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <div className="form-header">
          <button type="button" className="back-button w-max" onClick={goBack}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h2>
            {verify
              ? "Set New Password"
              : send
              ? "Verify OTP"
              : "Forgot Password"}
          </h2>
        </div>

        {errorMessage && (
          <Alert variant="danger" className="mb-3">
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" className="mb-3">
            {successMessage}
          </Alert>
        )}

        {/* Step 1: Enter Email */}
        {!send && !verify && (
          <form onSubmit={sendOTP}>
            <div className="form-group">
              <label>Email Address/Mobile Number</label>
              <input
                type="text"
                className={`form-control ${emailError ? "is-invalid" : ""}`}
                placeholder="Enter your email address"
                value={email}
                onChange={handleEmailChange}
                required
                autoComplete="email"
              />
              {emailError && (
                <div className="invalid-feedback">{emailError}</div>
              )}
              <small className="form-text text-muted">
                We'll send an OTP to this email address
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loadingSendOtp || !email || emailError}
            >
              {loadingSendOtp ? (
                <>
                  Sending... <Spinner animation="border" size="sm" />
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {send && !verify && (
          <form onSubmit={verifyOtp}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="email-display">{email}</div>
            </div>

            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                className="form-control otp-input"
                placeholder="Enter 6-digit OTP"
                value={enteredOtp}
                onChange={handleOtpChange}
                maxLength="6"
                pattern="[0-9]{6}"
                title="Please enter a 6-digit OTP"
                required
                autoComplete="one-time-code"
              />
              <small className="form-text text-muted">
                Please enter the 6-digit OTP sent to your email
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-success btn-block"
              disabled={loadingVerifyOtp || enteredOtp.length !== 6}
            >
              {loadingVerifyOtp ? (
                <>
                  Verifying... <Spinner animation="border" size="sm" />
                </>
              ) : (
                "Verify OTP"
              )}
            </button>

            <div className="text-center mt-3">
              {!canResend && countdown > 0 ? (
                <small className="text-muted">
                  Resend OTP in {countdown} seconds
                </small>
              ) : (
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={resendOTP}
                  disabled={!canResend}
                >
                  Didn't receive OTP? Resend
                </button>
              )}
            </div>
          </form>
        )}

        {/* Step 3: Set New Password */}
        {verify && (
          <form onSubmit={updatePassword}>
            <div className="form-group">
              <label>New Password</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control ${
                    passwordError ? "is-invalid" : ""
                  }`}
                  placeholder="Enter new password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {passwordError && (
                <div className="invalid-feedback">{passwordError}</div>
              )}
              <small className="form-text text-muted">
                Must contain uppercase, lowercase, number and special character
              </small>
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-with-icon">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`form-control ${
                    confirmPasswordError ? "is-invalid" : ""
                  }`}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>
              {confirmPasswordError && (
                <div className="invalid-feedback">{confirmPasswordError}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-success btn-block"
              disabled={
                loadingUpdatePassword ||
                !password ||
                !confirmPassword ||
                passwordError ||
                confirmPasswordError ||
                password !== confirmPassword
              }
            >
              {loadingUpdatePassword ? (
                <>
                  Updating... <Spinner animation="border" size="sm" />
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => history.push("/")}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
