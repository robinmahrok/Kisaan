import React, { useState, useEffect } from "react";
import axios from "axios";
import './otpVerify.css';
import { Spinner } from "react-bootstrap";
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

  useEffect(() => {
    const emailFromSession = sessionStorage.getItem("email");
    if (!emailFromSession) {
      alert("No email found!");
      history.push("/");
    } else {
      setEmail(emailFromSession);
    }
  }, [history]);

  const sendOTP = (e) => {
    e.preventDefault();
    setLoad(true);
    setErrorMessage("");

    axios
      .post(baseUrl + "/sendOtp", { email })
      .then((response) => {
        setLoad(false);
        if (response.data.status) {
          alert("OTP Sent!");
          setSend(true);
        } else {
          setErrorMessage(response.data.message);
        }
      })
      .catch((err) => {
        setLoad(false);
        setErrorMessage("Failed to send OTP. Please try again.");
      });
  };

  const handleOnChangeUserOTP = (e) => {
    setEnteredOtp(e.target.value);
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    setLoad2(true);
    setErrorMessage("");

    axios
      .post(baseUrl + "/verifyOtp", { email, otp: enteredOtp })
      .then((response) => {
        setLoad2(false);
        if (response.data.status) {
          alert("OTP Verified!");
          sessionStorage.removeItem("email");
          history.push("/");
        } else {
          setErrorMessage(response.data.message);
        }
      })
      .catch(() => {
        setLoad2(false);
        setErrorMessage("Failed to verify OTP. Please try again.");
      });
  };

  return (
    <div className="otp-container">
      <div className="otp-form">
        <h2>OTP Verification</h2>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <form onSubmit={verifyOtp}>
          <div className="form-group">
            <label>Email:</label>
            <span className="email-display">{email}</span>
          </div>

          {!send && (
            <div className="form-group">
              <button
                className="btn btn-primary btn-block"
                onClick={sendOTP}
                disabled={load}
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
                  placeholder="Enter the OTP"
                  onChange={handleOnChangeUserOTP}
                  value={enteredOtp}
                  required
                />
              </div>

              <button
                className="btn btn-success btn-block"
                type="submit"
                disabled={load2}
              >
                {load2 ? (
                  <>
                    Verifying... <Spinner animation="border" size="sm" />
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
