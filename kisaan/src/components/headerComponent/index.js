import React, { useState, useEffect } from "react";
import "./header.css";
import { useHistory } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Token } from "../../utils/utils";
import { Navbar, Nav } from 'react-bootstrap';

export default function Header() {
  let history = useHistory();

  const [name, setName] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) {
      const token = localStorage.getItem("token");
      const nameEmail = Token(token);

      const userName = nameEmail.split(",")[0];
      setName(userName);
    } else {
      history.push("/");
    }
  }, [history]);

  const handleNavigation = (path) => {
    history.push(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    history.push("/");
  };

  return (
    <div className="header">
      <Navbar expand="sm" variant="dark" className="header-navbar">
        <Navbar.Brand>Kisaan</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link onClick={() => handleNavigation("/home")}>Home</Nav.Link>
            <Nav.Link onClick={() => handleNavigation("/allAccounts")}>My Items</Nav.Link>
            <Nav.Link onClick={() => handleNavigation("/request")}>Requests</Nav.Link>
            <Nav.Link onClick={() => handleNavigation("/aboutUs")}>About Us</Nav.Link>
            <Nav.Link onClick={() => handleNavigation("/ContactUs")}>Contact Us</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <div className="nav-item">
          <select className="user-dropdown" onChange={(e) => e.target.value === "Logout" && handleLogout()} required>
            <option value="" hidden>{name}</option>
            <option value="Logout">Log Out</option>
          </select>
        </div>
      </Navbar>
    </div>
  );
}
