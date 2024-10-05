// src/components/CustomAlert.js

import React from "react";
import './CustomAlert.css';

const CustomAlert = ({ message="Operation Success", type='success', onClose=()=>{} }) => {
  return (
    <div className={`alert alert-${type}`} role="alert">
      {message}
      <button type="button" className="close" onClick={onClose}>
        &times;
      </button>
    </div>
  );
};

export default CustomAlert;
