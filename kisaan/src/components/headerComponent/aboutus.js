import React, { useState, useEffect } from "react";
import "./header.css";
import { useHistory } from "react-router-dom";
import Header from "./header";
import Footer from "../footerComponent/footer";
import { Token } from "../../utils/utils";

export default function AboutUs() {
  var history = useHistory();
  const [Email, setEmail] = useState("");
  const [Name, setName] = useState("");

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

  return (
    <div className="App">
      <Header></Header>
      <div className="App-header">
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
          crossOrigin="anonymous"
        />
        <div>
          <h3> Kisaan </h3>
          <p>
            We have created this project to help farmers sell/buy seeds online from any part of India.
          </p>
          <p>
            We work day and night to achieve our goal. And we are 24x7 ready to
            assist you. You can contact us anytime.
          </p>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}
