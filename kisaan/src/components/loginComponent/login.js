import React, { useState } from "react";
import axios from "axios";
import "./login.css";
import { Spinner } from "react-bootstrap";
import { baseUrl } from "../../baseUrl";
import { Link, useHistory } from "react-router-dom";

export default function Login() {
  const history = useHistory();
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [load, setLoad] = useState(false);
  const [error, setError] = useState("");

  const handleOnChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleOnChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const LoginUser = (e) => {
    e.preventDefault();
    setLoad(true);
    setError(""); // Clear previous errors

    axios
      .post(baseUrl + "/login", { email: Email, password: password })
      .then((response) => {
        setLoad(false);
        if (response.data.status) {
          localStorage.setItem("token", response.data.message);
          history.push("/home");
        } else if (response.data.message === "Otp not verified.") {
          alert("Email not Verified. Verify your email first!");
          sessionStorage.setItem("email", Email);
          history.push("/otpVerify");
        } else {
          setError(response.data.message);
        }
      })
      .catch((err) => {
        setLoad(false);
        console.log(err);
        setError("An error occurred. Please try again.");
      });
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Welcome Kisaan!</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={LoginUser}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter your email"
              onChange={handleOnChangeEmail}
              value={Email}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter your password"
              onChange={handleOnChangePassword}
              value={password}
              required
            />
          </div>

          <button className="btn btn-success btn-block" type="submit" disabled={load}>
            {load ? (
              <>
                Logging in &nbsp;
                <Spinner animation="border" size="sm" />
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="additional-options">
          <Link to="/forgotPassword" className="btn btn-link">
            Forgot Password?
          </Link>
        </div>

        <p className="signup-prompt">
          Not registered yet?
          <Link to="/signUp" className="btn btn-primary ml-2">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
