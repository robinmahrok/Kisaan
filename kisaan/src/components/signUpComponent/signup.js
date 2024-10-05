import React, { useState } from "react";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { baseUrl } from "../../baseUrl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { mobileValidator } from "../../utils/utils";
import "./signup.css";
import { useHistory } from "react-router";

export default function SignUp() {
  let history = useHistory();

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const eye = <FontAwesomeIcon icon={faEye} />;
  const eyeSlash = <FontAwesomeIcon icon={faEyeSlash} />;
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, seterror] = useState("");
  const [load, setLoad] = useState(false);

  const handleOnChangeName = (e) => setName(e.target.value);
  const handleOnChangeEmail = (e) => setEmail(e.target.value);
  const handleOnChangeContactNumber = (e) => setContact(e.target.value);
  const handleOnChangePassword = (e) => setPassword(e.target.value);
  
  const handleOnChangeConfirmPassword = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    seterror(value !== password ? "Password and confirm password should be equal" : "");
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const loginUser = () => history.push("/");
  
  const SignUpUser = (e) => {
    e.preventDefault();
    setLoad(true);

    const userObj = { name, email, contact, password };

    if (mobileValidator(contact)) {
      axios.post(`${baseUrl}/signup`, userObj)
        .then((response) => {
          setLoad(false);
          if (response.data.status) {
            sessionStorage.setItem("email", email);
            alert("Data Saved!");
            history.push("/otpVerify");
          } else {
            alert(response.data.message);
          }
        })
        .catch((err) => {
          setLoad(false);
          console.log(err);
        });
    } else {
      setLoad(false);
      alert("Please enter a valid contact number!");
    }
  };

  return (
    <div className="App">
      <header className="App-header-login">
        <div>
          <form className="form" onSubmit={SignUpUser}>
            <h2>Create Account</h2>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              onChange={handleOnChangeName}
              value={name}
              required
            />
            
            <label htmlFor="contact">Contact No.:</label>
            <input
              type="tel"
              id="contact"
              onChange={handleOnChangeContactNumber}
              value={contact}
              required
            />
            
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              onChange={handleOnChangeEmail}
              value={email}
              required
            />
            
            <label htmlFor="password">Password:</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                onChange={handleOnChangePassword}
                value={password}
                required
              />
              <i className="eye" onClick={handleClickShowPassword}>
                {showPassword ? eyeSlash : eye}
              </i>
            </div>

            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              onChange={handleOnChangeConfirmPassword}
              value={confirmPassword}
              required
            />
            <div className="text-danger">{error}</div>
            
            <button type="submit" disabled={load}>
              {load ? <Spinner animation="border" variant="light" /> : "Create Account"}
            </button>
          </form>

          <p>
            Already have an account? &nbsp;
            <button onClick={loginUser}>Login</button>
          </p>
        </div>
      </header>
    </div>
  );
}
