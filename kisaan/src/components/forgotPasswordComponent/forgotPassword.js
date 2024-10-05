import React, { useState } from "react";
import axios from "axios";
import './forgotPassword.css';
import { Spinner } from "react-bootstrap";
import { baseUrl } from "../../baseUrl";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function OtpVerify() {
  let history = useHistory();

  const [email, setEmail] = useState("");
  const [send, setSend] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [enteredOtp, setEnteredOTP] = useState("");
  const [verify, setVerify] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [load, setLoad] = useState(false);
  const [load2, setLoad2] = useState(false);

  const handleOnChangeEmail = (e) => {
    e.preventDefault();
    setEmail(e.target.value);
  };

  const handleOnChangePassword = (e) => {
    e.preventDefault();
    setPassword(e.target.value);
  };

  const sendOTP = (e) => {
    e.preventDefault();
    setLoad(true);

    axios.post(`${baseUrl}/sendOtp`, { email })
      .then((response) => {
        setLoad(false);
        if (response.data.status) {
          alert("OTP Sent!");
          setSend(true);
        } else {
          alert(response.data.message);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoad(false);
      });
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    setLoad2(true);

    axios.post(`${baseUrl}/verifyOtp`, { email, otp: enteredOtp })
      .then((response) => {
        setLoad2(false);
        if (response.data.status) {
          setVerify(true);
        } else {
          alert(response.data.message);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoad(false);
      });
  };

  const handleOnChangeConfirmPassword = (e) => {
    const confirmPasswordVar = e.target.value;

    if (confirmPasswordVar !== password) {
      setError("Password and confirm password should be equal");
    } else {
      setError("");
    }
    setConfirmPassword(confirmPasswordVar);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleOnChangeUserOTP = (e) => {
    e.preventDefault();
    setEnteredOTP(e.target.value);
  };

  const UpdatePassword = (e) => {
    e.preventDefault();
    setLoad2(true);
    axios.post(`${baseUrl}/changePassword`, { email, password })
      .then((response) => {
        setLoad2(false);
        if (response.data.status) {
          alert("Password Changed");
          history.push("/");
        } else {
          alert(response.data.message);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoad2(false);
      });
  };

  return (
    <div className="App">
      <header className="App-header-forgot">
        <div className="form-container">
          <form className="form">
            {!verify && <h2>Forgot Password</h2>}
            <br />
            {!verify && (
              <>
                <label>Email:</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={handleOnChangeEmail}
                  required
                  className="form-input"
                />
                <button
                  className="btn btn-success"
                  onClick={sendOTP}
                  disabled={load || (send && !verify)}
                >
                  {load ? <Spinner animation="border" variant="light" /> : "Send OTP"}
                </button>
              </>
            )}
            {send && !verify && (
              <>
                <label>Enter OTP:</label>
                <input
                  type="text"
                  placeholder="OTP"
                  value={enteredOtp}
                  onChange={handleOnChangeUserOTP}
                  required
                  className="form-input"
                />
                <button
                  className="btn btn-success"
                  onClick={verifyOtp}
                  disabled={load2}
                >
                  {load2 ? <Spinner animation="border" variant="light" /> : "Verify"}
                </button>
              </>
            )}
            {verify && (
              <>
                <h3>Enter a new password</h3>
                <label>Password:</label>
                <div className="input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={password}
                    onChange={handleOnChangePassword}
                    required
                    className="form-input"
                  />
                  <i onClick={handleClickShowPassword} className="eye-icon">
                    {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                  </i>
                </div>
                <label>Confirm Password:</label>
                <div className="input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    placeholder="Confirm Password"
                    onChange={handleOnChangeConfirmPassword}
                    required
                    className="form-input"
                  />
                  <i onClick={handleClickShowPassword} className="eye-icon">
                    {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                  </i>
                </div>
                <div className="text-danger">{error}</div>
                <button className="btn btn-success" onClick={UpdatePassword} disabled={load2}>
                  {load2 ? <Spinner animation="border" variant="light" /> : "Update Password"}
                </button>
              </>
            )}
          </form>
        </div>
      </header>
    </div>
  );
}
