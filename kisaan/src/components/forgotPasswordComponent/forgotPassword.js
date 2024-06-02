import React, { useState } from "react";
import axios from "axios";
import './forgotPassword.css'
import { Spinner } from "react-bootstrap";
import { baseUrl } from "../../baseUrl";
import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function OtpVerify() {
  let history = useHistory();

  const [email, setEmail] = useState("");
  const [send, setSend] = useState(false);
  const [password, setPassword] = useState("");
  const [error, seterror] = useState("");
  const [Enteredotp, setEnteredOTP] = useState(0);
  const [otp, setOTP] = useState(0);
  const [verify, setVerify] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const eye = <FontAwesomeIcon icon={faEye} />;
  const eyeSlash = <FontAwesomeIcon icon={faEyeSlash} />;
  const [confirmPassword, setConfirmPassword] = useState("");
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

    axios
      .post(baseUrl + "/sendOtp", { email: email })
      .then((response) => {
        setLoad(false);
        if (response.data.status) {
          setOTP(response.data.message);
          alert("OTP Sent!");
          setSend(true);
        } else {
          alert(response.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const verifyOtp = (e) => {
    e.preventDefault();

    setLoad(true);

    axios
      .post(baseUrl + "/verifyOtp", { email: email, otp: Enteredotp })
      .then((response) => {
        setLoad(false);
        if (response.data.status) {
          setVerify(true);
        } else {
          alert(response.data.message);
        }
      })
      .catch((err) => {
        setLoad(false);
        console.log(err);
      });
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

  const handleOnChangeUserOTP = (e) => {
    e.preventDefault();
    setEnteredOTP(e.target.value);
  };

  const UpdatePassword = (e) => {
    e.preventDefault();
    setLoad2(true);
    axios
      .post(baseUrl + "/changePassword", { email: email, password: password })
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
        console.log(err);
      });
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
            {!verify && <h2>Forgot Password</h2>}
            <br></br>
            {!verify && <p>
              <label>Email : </label>
              <input
                style={{ borderRadius: "7px" }}
                type="text"
                placeholder="Email"
                name="Email"
                onChange={handleOnChangeEmail}
                value={email}
                required
              />
              <br />
              {!send && <button
                style={{ "marginLeft": "20%", "margin-top": '15px' }}
                className="btn btn-success"
                onClick={sendOTP}
              >
                {!load && <span>Send OTP</span>}
                {load && (
                  <Spinner animation="border" variant="primary"></Spinner>
                )}
              </button>}
            </p>}
            {send && !verify && (
              <div>
                <br />
                <br />

                <label>Enter OTP : </label>
                <input
                  style={{ borderRadius: "7px" }}
                  type="text"
                  placeholder="OTP"
                  name="otp"
                  onChange={handleOnChangeUserOTP}
                  required
                />
                <button
                  style={{ marginLeft: "20%" }}
                  className="btn btn-success"
                  onClick={verifyOtp}
                >
                  {!load2 && <span>Verify</span>}
                  {load2 && (
                    <Spinner animation="border" variant="primary"></Spinner>
                  )}
                </button>
              </div>
            )}
            <br />
            <br />

            {verify && (
              <div className="form">
                <h3>Enter a new password</h3>
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
                <i onClick={handleClickShowPassword} className="eye">
                  {showPassword ? eyeSlash : eye}
                </i>
                <div className="text-danger" style={{ fontSize: "15px" }}>
                  {" "}
                  {error}{" "}
                </div>
                <br />
                <button
                  className="btn btn-success button"
                  onClick={UpdatePassword}
                >
                  {!load2 && <span>Update Password</span>}
                  {load2 && (
                    <Spinner animation="border" variant="primary"></Spinner>
                  )}
                </button>
              </div>
            )}
          </form>
          <br />
        </div>
      </header>
    </div>
  );
}
