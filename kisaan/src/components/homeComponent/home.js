import React, { useState, useEffect } from "react";
import "./home.css";
import { Spinner } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import Header from "../headerComponent";
import Footer from "../footerComponent";
import { Token } from "../../utils/utils";

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
  }, [history]);

  const seller = (e) => {
    e.preventDefault();
    setLoad(true);
    history.push("/seller");
  };

  const buyer = (e) => {
    e.preventDefault();
    setLoad(true);
    history.push("/buyer");
  };

  return (
    <div className="app-container">
      <Header />
      <div className="content-container">
        <div className="welcome-section">
          <h2 className="welcome-text">Welcome, {Name}!</h2>
          <p className="user-email">{Email}</p>
        </div>

        <div className="form-container">
          <form>
            <h4 className="form-title">Select your role:</h4>

            <div className="button-group">
              <button className="btn btn-primary action-button" onClick={seller} disabled={load}>
                {load ? (
                  <>
                    Seller &nbsp;
                    <Spinner animation="border" variant="light" size="sm" />
                  </>
                ) : (
                  "Seller"
                )}
              </button>

              <button className="btn btn-secondary action-button" onClick={buyer} disabled={load}>
                {load ? (
                  <>
                    Buyer &nbsp;
                    <Spinner animation="border" variant="light" size="sm" />
                  </>
                ) : (
                  "Buyer"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
