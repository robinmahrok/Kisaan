import React, { useState, useEffect } from "react";
import axios from "axios";
import './otpVerify.css';
import { Spinner, Alert } from "react-bootstrap";
import { baseUrl } from "../../baseUrl";
import { useHistory } from "react-router-dom";

export default function OtpVerify() {
  const history = useHistory();
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
      setErrorMessage("No email found! Please start the verification process again.");
      setTimeout(() => {
        history.push("/");
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

    try {
      const response = await axios.post(`${baseUrl}/sendOtp`, { email });
      setLoad(false);
      
      if (response.data.status) {
        setSuccessMessage("OTP sent successfully! Please check your email.");
        setSend(true);
        setCanResend(false);
        setCountdown(60); // 60 seconds countdown for resend
      } else {
        setErrorMessage(response.data.message || "Failed to send OTP");
      }
    } catch (err) {
      setLoad(false);
      console.error("Send OTP error:", err);
      setErrorMessage(
        err.response?.data?.message || 
        "Failed to send OTP. Please check your internet connection and try again."
      );
    }
  };

  const handleOnChangeUserOTP = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) { // Limit to 6 digits
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

    try {
      const response = await axios.post(`${baseUrl}/verifyOtp`, { 
        email, 
        otp: parseInt(enteredOtp) // Ensure OTP is sent as number
      });
      
      setLoad2(false);
      
      if (response.data.status) {
        setSuccessMessage("OTP verified successfully! Redirecting...");
        sessionStorage.removeItem("email");
        
        // Redirect after a short delay to show success message
        setTimeout(() => {
          history.push("/");
        }, 2000);
      } else {
        setErrorMessage(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setLoad2(false);
      console.error("Verify OTP error:", err);
      setErrorMessage(
        err.response?.data?.message || 
        "Failed to verify OTP. Please check your internet connection and try again."
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
        <h2>OTP Verification</h2>

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

        <form onSubmit={send ? verifyOtp : sendOTP}>
          <div className="form-group">
            <label>Email:</label>
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
                    Sending... <Spinner animation="border" size="sm" />
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>
          )}

          {send && (
            <>
              <div className="form-group">
                <label>Enter OTP:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter 6-digit OTP"
                  onChange={handleOnChangeUserOTP}
                  value={enteredOtp}
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

              <div className="form-group">
                <button
                  className="btn btn-success btn-block"
                  type="submit"
                  disabled={load2 || enteredOtp.length !== 6}
                >
                  {load2 ? (
                    <>
                      Verifying... <Spinner animation="border" size="sm" />
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
              </div>

              <div className="form-group text-center">
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
            </>
          )}
        </form>

        <div className="form-group text-center mt-3">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => history.push("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
