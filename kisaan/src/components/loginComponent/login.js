import React, { useState } from "react";
import axios from "axios";
import "./login.css";
import { Spinner } from "react-bootstrap";
import { baseUrl } from "../../baseUrl";
import { Link, useHistory } from "react-router-dom";

export default function Login() {
  var history = useHistory();
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [load, setLoad] = useState(false);
  const handleOnChangeEmail = (e) => {
    e.preventDefault();
    setEmail(e.target.value);
  };
  const handleOnChangePassword = (e) => {
    e.preventDefault();
    setPassword(e.target.value);
  };

  const LoginUser = (e) => {
    e.preventDefault();
    setLoad(true);

    axios
      .post(baseUrl + "/login", { email: Email, password: password })
      .then((response) => {
        setLoad(false);
        if (response.data.status) {
          localStorage.setItem("token", response.data.message);
          history.push("/home");
        } else if (response.data.message == "Otp not verified.") {
          alert("Email not Verified. Verify your email first!");
          sessionStorage.setItem("email", Email);
          history.push("/otpVerify");
        } else {
          alert(response.data.message);
        }
      })
      .catch((err) => {
        setLoad(false);
        console.log(err);
      });
  };
  return (
    <div className="App">
      <div className="App-header-login">
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
          crossOrigin="anonymous"
        />
        <div>
          <form className="form">
            <h2>Welcome Kisaan!</h2>
            <br></br>
            <label>Email : </label>
            <input
              style={{ borderRadius: "7px" }}
              type="text"
              placeholder="Email"
              name="Email"
              onChange={handleOnChangeEmail}
              value={Email}
              required
            />{" "}
            <br />
            <label>Password : </label>
            <input
              type="password"
              style={{ borderRadius: "7px" }}
              placeholder="Password"
              onChange={handleOnChangePassword}
              value={password}
              name="password"
              required
            />{" "}
            <br />
            <button
              className="btn btn-success button"
              onClick={LoginUser}
            >
              {!load && <span>Login</span>}
              {load && <Spinner animation="border" variant="primary"></Spinner>}
            </button>
          </form>
          <br />
          <Link to="/forgotPassword">
            <button className="btn btn-primary button">
              Forgot Password
            </button>
          </Link>
          <br />
          <br />
          <p>
            Not registered yet?
            <Link to="/signUp">
              <button
                style={{ marginLeft: "20px" }}
                className="btn btn-primary"
              >
                SignUp
              </button>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
