import React, { useEffect } from "react";
import "./contactUs.css"; // Create a separate CSS file for the About Us page styles
import { useHistory } from "react-router-dom";
import Header from "../../headerComponent";
import Footer from "../../footerComponent";

export default function ContactUs() {
  const history = useHistory();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      history.push("/");
    }
  }, [history]);

  return (
    <div className="about-us">
      <Header />
      <div className="about-content">
        <h1 className="about-title">Kisaan</h1>
        <p className="about-description">
          We have created this project to help farmers sell and buy seeds online from any part of India.
        </p>
        <p className="about-description">
          We work day and night to achieve our goal. We are 24/7 ready to assist you. You can contact us anytime.
        </p>
      </div>
      <Footer />
    </div>
  );
}
