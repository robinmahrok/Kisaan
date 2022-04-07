import React, { useState, useEffect } from "react";
import "./header.css";
import { useHistory } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Token from "../../utils/utils";

export default function Header() {
  let history = useHistory();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [home, setHome] = useState(false);
  const [profile, setProfile] = useState(false);
  const [contact, setContact] = useState(false);
  const [about, setAbout] = useState(false);
  const [request, setrequest] = useState(false);


  //const user = <FontAwesomeIcon icon={} />;

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
    setAbout(false);
    setHome(false);
    setContact(true);
    setProfile(false);
    setrequest(false);
    history.push("/ContactUs");
  };
  const handleOnChangeAccounts = (e) => {
    e.preventDefault();
    setAbout(false);
    setHome(false);
    setContact(false);
    setProfile(true);
    setrequest(false);

    history.push("/allAccounts");
  };
  const handleOnChangeRequest = (e) => {
    e.preventDefault();
    setAbout(false);
    setHome(false);
    setContact(false);
    setProfile(false);
    setrequest(true);

    history.push("/request");
  };

  const handleOnChangeAbout = (e) => {
    e.preventDefault();
    setAbout(true);
    setHome(false);
    setContact(false);
    setProfile(false);
    setrequest(false);

    history.push("/aboutUs");
  };

  const handleOnChangeSelect = (e) => {
    e.preventDefault();

    if (e.target.value == "Logout") {
      localStorage.removeItem("token");
      history.push("/");
    
    }
  };

  const handleOnChangeHome = (e) => {
    e.preventDefault();

    setAbout(false);
    setHome(true);
    setContact(false);
    setProfile(false);
    setrequest(false);

    history.push("/home");
  };

  return (
    <div className="App">
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
        crossOrigin="anonymous"
      />
      <div>
        <nav className="navbar navbar-expand-sm bg-primary navbar-dark">
          <ul className="navbar-nav">
            <li className="nav-item active">
              <button
                className="btn btn-primary"
                autoFocus={home}
                onClick={handleOnChangeHome}
              >
                Home
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-primary"
                autoFocus={profile}
                onClick={handleOnChangeAccounts}
              >
                My Items
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-primary"
                onClick={handleOnChangeRequest}
              >
                Requests
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-primary"
                autoFocus={about}
                onClick={handleOnChangeAbout}
              >
                About Us
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-primary"
                autoFocus={contact}
                onClick={handleOnChangeContact}
              >
                Contact Us
              </button>
            </li>
            <li className="nav-item" style={{ alignContent: "right" }}>
              <select
                className="blueText"
                onChange={handleOnChangeSelect}
                required
              >
                <option value="" defaultValue hidden>
                  {" "}
                  {name}{" "}
                </option>
                <option value="Logout">Log Out</option>
              </select>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
