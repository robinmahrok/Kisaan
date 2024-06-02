import React, { useState, useEffect } from "react";
import axios from "axios";
import './otpVerify.css'
import { Spinner } from "react-bootstrap";
import { baseUrl } from "../../baseUrl";
import { useHistory } from "react-router-dom";

export default function OtpVerify() {
  let history = useHistory();

  const [email, setEmail] = useState("");
  const [send, setSend] = useState(false);
  const [Enteredotp, setEnteredOTP] = useState(0);
  const [otp, setOTP] = useState(0);
  const [verify, setVerify] = useState(false);
  const [load, setLoad] = useState(false);
  const [load2, setLoad2] = useState(false);


  useEffect(() => {
    if (!sessionStorage.getItem("email")) {
      alert("No email found!");
      history.push("/");
    }
    else {
      setEmail(sessionStorage.getItem("email"));
    }
  });

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



  const handleOnChangeUserOTP = (e) => {
    e.preventDefault();
    setEnteredOTP(e.target.value);
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    setLoad2(true);
    axios
      .post(baseUrl + "/verifyOtp", { email: email, otp: Enteredotp })
      .then(async (response) => {
        setLoad2(false);
        if (response.data.status) {
          await handleOnChangeOTP()
        } else {
          alert(response.data.message);
        }
      })
      .catch((err) => {
        setLoad2(false);
        console.log(err);
      });
  };


  const handleOnChangeOTP = () => {
    setLoad2(true);
    axios
      .post(baseUrl + "/otpVerify", { email: email })
      .then((response) => {
        setLoad2(false);
        if (response.data.status) {
          setVerify(true);
          sessionStorage.removeItem("email");
          setSend(true);
          alert("OTP Verified");
          history.push("/");
        } else {
          setLoad2(false);
          alert(response.data.message);
        }
      })
      .catch((err) => {
        setLoad2(false);
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
            <h2>OTP Verification</h2>
            <br></br>
            <p>
              <label>Email : </label> &nbsp;
              <label className="label">{email}</label>
              <br />
              <br />
              {!send && <div><button
                className="btn btn-success button"
                onClick={sendOTP}
              >
                {!load && <span>Click Here</span>}
                {load && (
                  <Spinner animation="border" variant="primary"></Spinner>
                )}
              </button>
                <label>&nbsp;to send OTP</label></div>}
            </p>
            {send && (
              <div>

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
                  className="btn btn-success button"
                  onClick={verifyOtp}
                >
                  {!load2 && <span>Verify</span>}
                  {load2 && (
                    <Spinner animation="border" variant="success"></Spinner>
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
