import React, { useState, useEffect } from "react";
import "./home.css";
import { Spinner } from "react-bootstrap";
import {  useHistory } from "react-router-dom";
import Header from "../headerComponent/header";
import Footer from "../footerComponent/footer";
import Token from "../../utils/utils";

export default function Home() {
  var history = useHistory();
  const [Name, setName] = useState("");
  const [Email, setEmail] = useState("");


  const [load, setLoad] = useState(false);
 

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



  const seller = (e) => {
    e.preventDefault();
    setLoad(true);
    history.push('/seller');
  };

  const buyer = (e) => {
    e.preventDefault();
    setLoad(true);
    history.push('/buyer');
  };

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
          <form>
            <h2>{Name}</h2>

            <div>
              <br />
              <label>Are you a seller or buyer? &nbsp;</label>
              <button
                  style={{ marginLeft: "20%" }}
                  className="btn btn-primary"
                  onClick={seller}
                >
                  Seller
                  {load && (
                    <Spinner animation="border" variant="primary"></Spinner>
                  )}
                </button>
                  <br />
                  <br />
                <button
                  style={{ marginLeft: "20%" }}
                  className="btn btn-primary"
                  onClick={buyer}
                >
                  Buyer
                  {load && (
                    <Spinner animation="border" variant="primary"></Spinner>
                  )}
                </button>
              <br />
              <br />
            </div>
          </form>
      </div>
    </div>
    <Footer></Footer>
</div>
  );
}
