import React, { useState, useEffect } from "react";
import { Spinner, Alert } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { useTranslate } from "../../hooks/useTranslate";
import { authService } from "../../services";
import "./otpVerify.css";
export default function OtpVerify() {
  const history = useHistory();
  const { t } = useTranslate();
  const [email, setEmail] = useState("");
  const [send, setSend] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [load, setLoad] = useState(false);
  const [load2, setLoad2] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const emailFromSession = sessionStorage.getItem("email");
    if (!emailFromSession) {
      setErrorMessage(
        "No email found! Please start the verification process again."
      );
      setTimeout(() => {
        history.push("/login");
      }, 3000);
    } else {
      setEmail(emailFromSession);
    }
  }, [history]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (send && countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, send]);

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoad(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Use authService instead of axios
    const result = await authService.sendOTP(email);
    setLoad(false);

    if (result.success && result.data.status) {
      setSuccessMessage("OTP sent successfully! Please check your email.");
      setSend(true);
      setCanResend(false);
      setCountdown(60); // 60 seconds countdown for resend
    } else {
      setErrorMessage(
        result.error || result.data?.message || "Failed to send OTP"
      );
    }
  };

  const handleOnChangeUserOTP = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      // Limit to 6 digits
      setEnteredOtp(value);
      setErrorMessage(""); // Clear error when user starts typing
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!enteredOtp) {
      setErrorMessage("Please enter the OTP");
      return;
    }

    if (enteredOtp.length !== 6) {
      setErrorMessage("OTP must be 6 digits");
      return;
    }

    setLoad2(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Use authService instead of axios
    const result = await authService.verifyOTP({
      email,
      otp: parseInt(enteredOtp),
    });

    setLoad2(false);

    if (result.success && result.data.status) {
      setSuccessMessage("OTP verified successfully! Redirecting...");
      sessionStorage.removeItem("email");

      // Redirect after a short delay to show success message
      setTimeout(() => {
        history.push("/login");
      }, 2000);
    } else {
      setErrorMessage(
        result.error || result.data?.message || "Invalid OTP. Please try again."
      );
    }
  };

  const resendOTP = () => {
    setEnteredOtp("");
    setSend(false);
    setCanResend(false);
    setCountdown(0);
  };

  return (
    <div className="otp-container">
      <div className="otp-form">
        <h2>{t("OTP Verification")}</h2>

        {errorMessage && (
          <Alert variant="danger" className="mb-3">
            {t(`${errorMessage}`)}
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" className="mb-3">
            {t(`${successMessage}`)}
          </Alert>
        )}

        <form onSubmit={send ? verifyOtp : sendOTP}>
          <div className="form-group">
            <label>{t("Email")}:</label>
            <span className="email-display">{email}</span>
          </div>

          {!send && (
            <div className="form-group">
              <button
                className="btn btn-primary btn-block"
                type="submit"
                disabled={load || !email}
              >
                {load ? (
                  <>
                    {t("Sending")}... <Spinner animation="border" size="sm" />
                  </>
                ) : (
                  t("Send OTP")
                )}
              </button>
            </div>
          )}

          {send && (
            <>
              <div className="form-group">
                <label>{t("Enter OTP")}:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t("Enter 6-digit OTP")}
                  onChange={handleOnChangeUserOTP}
                  value={enteredOtp}
                  maxLength="6"
                  pattern="[0-9]{6}"
                  title="Please enter a 6-digit OTP"
                  required
                  autoComplete="one-time-code"
                />
                <small className="form-text text-muted">
                  {t("Please enter the 6-digit OTP sent to your email")}
                </small>
              </div>

              <div className="form-group">
                <button
                  className="btn btn-success btn-block"
                  type="submit"
                  disabled={load2 || enteredOtp.length !== 6}
                >
                  {load2 ? (
                    <>
                      {t("Verifying")}...{" "}
                      <Spinner animation="border" size="sm" />
                    </>
                  ) : (
                    t("Verify OTP")
                  )}
                </button>
              </div>

              <div className="form-group text-center">
                {!canResend && countdown > 0 ? (
                  <small className="text-muted">
                    {t("Resend OTP in")} {countdown} {t("seconds")}
                  </small>
                ) : (
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={resendOTP}
                    disabled={!canResend}
                  >
                    {t("Didn't receive OTP?")} {t("Resend")} {t("OTP")}
                  </button>
                )}
              </div>
            </>
          )}
        </form>

        <div className="form-group text-center mt-3">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => history.push("/login")}
          >
            {t("Back to Login")}
          </button>
        </div>
      </div>
    </div>
  );
}
