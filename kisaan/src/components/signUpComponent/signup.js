import React, { useState } from "react";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { baseUrl } from "../../baseUrl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";
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

  const handleOnChangeName = (e) => {
    e.preventDefault();
    setName(e.target.value);
  };

  const handleOnChangeEmail = (e) => {
    e.preventDefault();
    setEmail(e.target.value);
  };
  const handleOnChangeContactNumber = (e) => {
    e.preventDefault();
    setContact(e.target.value);
  };

  const handleOnChangePassword = (e) => {
    e.preventDefault();
    setPassword(e.target.value);
  };
  const handleOnChangeConfirmPassword = (e) => {
    // e.preventDefault();

    if (e.target.value !== password) {
      seterror("Password and confirm password should be equal");
    } else {
      seterror("");
    }
    setConfirmPassword(e.target.value);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const loginUser = () => {
    history.push("/");
  };

  const SignUpUser = (e) => {
    e.preventDefault();
    setLoad(true);

    const userObj = {
      name: name,
      email: email,
      contact: contact,
      password: password,
    };

    if (mobileValidator(contact)) {
      axios
        .post(baseUrl + "/signup", userObj)
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
      alert("Please enter valid contact number!");
    }
  };



  return (
    <div className="App">
      <header className="App-header-login">
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
          crossOrigin="anonymous"
        />
        <div>
          <form className="form">
            <h2>Create Account</h2>
            <br></br>
            <label>Name : </label>
            <input
              style={{ borderRadius: "7px" }}
              type="text"
              name="name"
              onChange={handleOnChangeName}
              value={name}
              required
            />{" "}
            <br />
            <label>Contact No. : </label>
            <input
              style={{ borderRadius: "7px" }}
              type="number"
              name="contactNumber"
              onChange={handleOnChangeContactNumber}
              value={contact}
              required
            />{" "}
            <br />
            <label>Email : </label>
            <input
              style={{ borderRadius: "7px" }}
              type="email"
              name="email"
              onChange={handleOnChangeEmail}
              value={email}
            />{" "}
            <br />
            <label>Password : </label>
            <input
              type="password"
              style={{ borderRadius: "7px" }}
              onChange={handleOnChangePassword}
              value={password}
              name="password"
              required
            />{" "}
            <br />
            <label>Confirm Password : </label>
            <input
              type={showPassword ? "text" : "password"}
              style={{ borderRadius: "7px" }}
              onChange={handleOnChangeConfirmPassword}
              value={confirmPassword}
              name="confirmpassword"
              required
            />{" "}
            <i className="eye" onClick={handleClickShowPassword}>
              {showPassword ? eyeSlash : eye}
            </i>
            <div className="text-danger" style={{ fontSize: "15px" }}>
              {" "}
              {error}{" "}
            </div>
            <button
              className="btn btn-success button"
              onClick={SignUpUser}
            >
              {!load && <span>Create Account</span>}
              {load && <Spinner animation="border" variant="primary"></Spinner>}
            </button>
          </form>

          <p>
            {" "}
            Already have an account? &nbsp;
            <button
              className="btn btn-primary button"
              onClick={loginUser}
            >
              Login
            </button>
          </p>
        </div>
      </header>
    </div>
  );
}
