import React, { useState, useEffect } from "react";
import "./footer.css";

import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import Token from "../../utils/utils";

export default function Footer() {
  let history = useHistory();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) {
      var token = localStorage.getItem("token");
      var nameEmail = Token(token);

      var name = nameEmail.split(",")[0];
      var userId = nameEmail.split(",")[1];
      setEmail(userId);
      setName(name);
    } else {
      history.push("/");
    }
  });

  const handleOnChangeContact = (e) => {
    e.preventDefault();
    history.push("/ContactUs");
  };

  const handleOnChangeAbout = (e) => {
    e.preventDefault();
    history.push("/aboutUs");
  };

  const handleOnChangeHome = (e) => {
    e.preventDefault();
    history.push("/home");
  };

  return (
    <div className="App">
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css"
      ></link>
      <footer className="footer">
        <div className="footer-left col-md-4 col-sm-6">
          <p className="about">
            <span>Kisaan</span>
          </p>
          <div className="icons">
            <a href="#">
              <i className="fa fa-facebook"></i>
            </a>
            &nbsp;&nbsp;
            <a href="#">
              <i className="fa fa-twitter"></i>
            </a>
            &nbsp;&nbsp;
            <a href="#">
              <i className="fa fa-linkedin"></i>
            </a>
            &nbsp;&nbsp;
            <a href="#">
              <i className="fa fa-google-plus"></i>
            </a>
            &nbsp;&nbsp;
            <a href="#">
              <i className="fa fa-instagram"></i>
            </a>
          </div>
        </div>
        <div className="footer-center col-md-4 col-sm-6"></div>
        <div className="footer-right col-md-4 col-sm-6">
          <p className="menu">
            <button
              className="secondary"
              style={{ borderRadius: "5px" }}
              onClick={handleOnChangeHome}
            >
              {" "}
              Home
            </button>{" "}
            | &nbsp;
            <button
              className="secondary"
              style={{ borderRadius: "5px" }}
              onClick={handleOnChangeAbout}
            >
              {" "}
              About Us
            </button>{" "}
            |&nbsp;
            <button
              className="secondary"
              style={{ borderRadius: "5px" }}
              onClick={handleOnChangeContact}
            >
              {" "}
              Contact Us
            </button>
          </p>
          <p className="name"> Kisaan &copy; 2022</p>
        </div>
      </footer>
    </div>
  );
}
