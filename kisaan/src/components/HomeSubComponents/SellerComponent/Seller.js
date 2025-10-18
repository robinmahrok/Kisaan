import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./Seller.css";
import { Spinner, Alert } from "react-bootstrap";
import { Autocomplete } from "@material-ui/lab";
import { TextField } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import Header from "../../headerComponent";
import Footer from "../../footerComponent";
import { Token } from "../../../utils/utils";
import statesofIndia from "../../../utils/states";
import { useTranslate } from "../../../hooks/useTranslate";
import { itemService } from "../../../services";
import { getAuthToken } from "../../../utils/cookies";

// Constants
const INITIAL_FORM_DATA = {
  product: "",
  variety: "",
  quantity: "",
  price: "",
  state: "",
  city: "",
  zipcode: "",
  address: "",
  harvestDate: "",
};

const REQUIRED_FIELDS = [
  "product",
  "variety",
  "quantity",
  "price",
  "state",
  "city",
  "zipcode",
  "address",
  "harvestDate",
];

// Validation utilities
const validators = {
  zipcode: (zipcode) => {
    if (!zipcode) return "Pincode is required";
    if (!/^\d{6}$/.test(zipcode)) return "Pincode must be exactly 6 digits";
    if (zipcode.charAt(0) === "0") return "Invalid pincode format";
    return "";
  },

  quantity: (quantity) => {
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      return "Please enter a valid quantity (positive numbers only)";
    }
    return "";
  },

  price: (price) => {
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      return "Please enter a valid price (positive numbers only)";
    }
    return "";
  },

  harvestDate: (date) => {
    if (!date) return "Harvest date is required";
    const selectedDate = new Date(date);
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    if (selectedDate > today) {
      return "Harvest date cannot be in the future";
    }
    if (selectedDate < oneYearAgo) {
      return "Harvest date cannot be more than 1 year ago";
    }
    return "";
  },
};

// Input sanitizers
const sanitizers = {
  zipcode: (value) => {
    value = value.replace(/\D/g, "");
    return value.length > 6 ? value.slice(0, 6) : value;
  },

  quantity: (value) => {
    value = value.replace(/[^0-9]/g, "");
    if (value.startsWith("0") && value.length > 1) {
      value = value.replace(/^0+/, "");
    }
    return value;
  },

  price: (value) => {
    value = value.replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) {
      value = parts[0] + "." + parts.slice(1).join("");
    }
    if (value.startsWith("0") && value.length > 1 && value.charAt(1) !== ".") {
      value = value.replace(/^0+/, "");
    }
    if (value.startsWith(".")) {
      value = "0" + value;
    }
    return value;
  },
};

export default function Seller() {
  const history = useHistory();
  const { t } = useTranslate();
  // Form data state
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Other states
  const [productListState, setProductList] = useState([]);
  const [varietyListState, setVarietyList] = useState([]);
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
    contact: "",
  });
  const [image, setImage] = useState({ image: null });
  const [load, setLoad] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Memoized state options
  const stateOptions = useMemo(
    () => statesofIndia.map((state) => state.name),
    []
  );

  // Initialize user data and products
  useEffect(() => {
    const token = getAuthToken(); // Get token from cookies
    if (!token) {
      history.push("/");
      return;
    }

    const loadUserDataAndProducts = async () => {
      try {
        const nameEmail = Token(token);
        const [name, userId, contact] = nameEmail.split(",");
        setUserInfo({ email: userId, name, contact });

        // Fetch products using itemService (token in headers automatically)
        const result = await itemService.getProducts();

        if (result.success && result.data.status) {
          const prodVarData = result.data.message;
          localStorage.setItem("prodVarData", JSON.stringify(prodVarData));
          setProductList(Object.keys(prodVarData));
        } else {
          setErrorMessage(
            result.error ||
              result.data?.message ||
              "Failed to load products. Please try again."
          );
        }
      } catch (error) {
        console.error("Error loading user info:", error);
        history.push("/");
      }
    };

    loadUserDataAndProducts();
  }, [history]);

  // Optimized input change handler
  const handleInputChange = useCallback(
    (field) => (e) => {
      let value = e.target.value;

      // Apply sanitizer if exists
      if (sanitizers[field]) {
        value = sanitizers[field](value);
      }

      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error messages when user starts typing
      if (errorMessage) setErrorMessage("");
    },
    [errorMessage]
  );

  // Product change handler
  const handleProductChange = useCallback(
    (selectedProduct) => {
      if (!selectedProduct) {
        setVarietyList([]);
        setFormData((prev) => ({ ...prev, product: "", variety: "" }));
        setShowOther(false);
        if (errorMessage) setErrorMessage("");
        return;
      }

      try {
        const prodVar = JSON.parse(localStorage.getItem("prodVarData"));
        if (
          prodVar &&
          prodVar[selectedProduct] &&
          prodVar[selectedProduct][0]
        ) {
          const varieties = prodVar[selectedProduct][0];
          setVarietyList([...Object.values(varieties), "Other"]);
        } else {
          setVarietyList(["Other"]);
        }

        setFormData((prev) => ({
          ...prev,
          product: selectedProduct,
          variety: "",
        }));
        setShowOther(false);
        if (errorMessage) setErrorMessage("");
      } catch (error) {
        console.error("Product data parsing error:", error);
        setVarietyList(["Other"]);
      }
    },
    [errorMessage]
  );

  // Variety change handler
  const handleVarietyChange = useCallback(
    (selectedVariety) => {
      setFormData((prev) => ({ ...prev, variety: selectedVariety }));
      setShowOther(selectedVariety === "Other");
      if (errorMessage) setErrorMessage("");
    },
    [errorMessage]
  );

  // File change handler
  const handleFileChange = useCallback(
    (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];

        // Basic file validation
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          setErrorMessage("File size must be less than 10MB");
          return;
        }

        if (!file.type.startsWith("image/")) {
          setErrorMessage("Please select a valid image file");
          return;
        }

        setImage({ image: file });
        if (errorMessage) setErrorMessage("");
      }
    },
    [errorMessage]
  );

  // Form validation
  const validateForm = useCallback(() => {
    // Check required fields
    const missingFields = REQUIRED_FIELDS.filter((field) => !formData[field]);
    if (missingFields.length > 0 || !image.image) {
      return "All fields including image are required!";
    }

    // Validate specific fields
    for (const [field, validator] of Object.entries(validators)) {
      const error = validator(formData[field]);
      if (error) return error;
    }

    return "";
  }, [formData, image.image]);

  // Form submission handler
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoad(true);
      setErrorMessage("");
      setSuccessMessage("");

      // Validate form
      const validationError = validateForm();
      if (validationError) {
        setErrorMessage(validationError);
        setLoad(false);
        return;
      }

      try {
        const token = getAuthToken();
        const sellerId = Token(token).split(",")[3];

        const data = {
          SellerId: sellerId,
          Name: userInfo.name,
          Email: userInfo.email,
          Contact: userInfo.contact,
          Product: formData.product,
          Variety: formData.variety,
          Quantity: formData.quantity,
          State: formData.state,
          City: formData.city,
          Pin: formData.zipcode,
          Address: formData.address,
          Price: formData.price,
          HarvestDate: formData.harvestDate,
          token,
        };

        const result = await itemService.addSellerData(data);

        if (result.success && result.data.status) {
          const id = result.data.message;

          const formDataUpload = new FormData();
          formDataUpload.append("file", image.image);
          formDataUpload.append("fileName", id);

          const uploadResult = await itemService.uploadFile(formDataUpload);

          if (uploadResult.success) {
            setSuccessMessage("Product added successfully! Redirecting...");
            setTimeout(() => history.push("/home"), 200);
          } else {
            setErrorMessage(
              uploadResult.error ||
                "Could not upload the image. Please try again."
            );
          }
        } else {
          setErrorMessage(
            result.error || result.data?.message || "Failed to add product"
          );
        }
      } catch (err) {
        setErrorMessage("An error occurred. Please try again.");
      } finally {
        setLoad(false);
      }
    },
    [formData, image.image, userInfo, validateForm, history]
  );

  // Autocomplete component factory
  const createAutocomplete = useCallback(
    (
      id,
      options,
      value,
      onChange,
      placeholder,
      disabled = false,
      noOptionsText = "No options found"
    ) => (
      <Autocomplete
        id={id}
        options={options}
        value={value || null}
        disabled={disabled}
        onChange={(event, newValue) => onChange(newValue || "")}
        renderInput={(params) => (
          <div className="autocomplete-wrapper">
            <TextField
              {...params}
              placeholder={placeholder}
              variant="outlined"
              className="mui-autocomplete"
              required
              disabled={disabled}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <div className="custom-endAdornment">
                    {value && (
                      <button
                        type="button"
                        className="custom-clear-btn"
                        onClick={() => onChange("")}
                        aria-label="Clear selection"
                        disabled={disabled}
                      >
                        ✕
                      </button>
                    )}
                    <button
                      type="button"
                      className="custom-dropdown-btn"
                      aria-label="Toggle dropdown"
                      disabled={disabled}
                    >
                      ▼
                    </button>
                  </div>
                ),
              }}
            />
          </div>
        )}
        noOptionsText={noOptionsText}
        clearOnEscape
        openOnFocus
        selectOnFocus
        handleHomeEndKeys
        disableClearable
      />
    ),
    []
  );

  return (
    <div className="seller-page">
      <Header />

      <div className="seller-container">
        <div className="seller-content">
          {/* Header Section */}
          <div className="seller-header">
            <div className="seller-icon">🌾</div>
            <h1 className="seller-title">{t("Add Your Product")}</h1>
            <p className="seller-subtitle">
              {t(
                "Share your agricultural products with buyers across the marketplace"
              )}
            </p>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <Alert variant="danger" className="modern-alert alert-error">
              <strong>⚠️ Error:</strong> {t(`${errorMessage}`)}
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success" className="modern-alert alert-success">
              <strong>✅ Success:</strong> {t(`${successMessage}`)}
            </Alert>
          )}

          {/* Form Card */}
          <div className="seller-form-card">
            <form onSubmit={handleSubmit} className="seller-form">
              {/* Product Selection */}
              <div className="form-section">
                <h3 className="section-title">{t("📦 Product Information")}</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      {t("Product Type")} <span className="required">*</span>
                    </label>
                    {createAutocomplete(
                      "product-autocomplete",
                      productListState,
                      formData.product,
                      handleProductChange,
                      t("Search and choose your product..."),
                      false,
                      "No products found"
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {t("Variety")} <span className="required">*</span>
                    </label>
                    {createAutocomplete(
                      "variety-autocomplete",
                      varietyListState,
                      formData.variety,
                      (value) => {
                        handleVarietyChange(value);
                        if (!value || value !== "Other") {
                          setShowOther(false);
                        }
                      },
                      t("Search and select variety..."),
                      !formData.product,
                      !formData.product
                        ? t("Select a product first")
                        : t("No varieties found")
                    )}
                    {showOther && (
                      <input
                        type="text"
                        className="form-control modern-input mt-2"
                        placeholder={t("Enter custom variety")}
                        onChange={handleInputChange("variety")}
                        value={
                          formData.variety === "Other" ? "" : formData.variety
                        }
                        required
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity & Price */}
              <div className="form-section">
                <h3 className="section-title">{t("💰 Pricing & Quantity")}</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="quantity" className="form-label">
                      {t("Quantity (Kg)")} <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="quantity"
                      className="form-control modern-input"
                      placeholder={t("Enter quantity in kg")}
                      onChange={handleInputChange("quantity")}
                      value={formData.quantity}
                      inputMode="numeric"
                      pattern="[1-9][0-9]*"
                      title={t(
                        "Enter a valid quantity (positive numbers only)"
                      )}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="price" className="form-label">
                      {t("Price (₹/Kg)")} <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="price"
                      className="form-control modern-input"
                      placeholder={t("Enter price in ₹/kg (e.g., 25.50)")}
                      onChange={handleInputChange("price")}
                      value={formData.price}
                      inputMode="decimal"
                      pattern="[0-9]+(\.[0-9]{1,2})?"
                      title={t(
                        "Enter a valid price (numbers and decimals only)"
                      )}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="harvestDate" className="form-label">
                      {t("Harvest Date")} <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      id="harvestDate"
                      className="form-control modern-input"
                      onChange={handleInputChange("harvestDate")}
                      value={formData.harvestDate}
                      max={new Date().toISOString().split("T")[0]}
                      min={
                        new Date(
                          new Date().setFullYear(new Date().getFullYear() - 1)
                        )
                          .toISOString()
                          .split("T")[0]
                      }
                      title={t("Select the date when the crop was harvested")}
                      required
                    />
                    <small className="date-hint">
                      {t(
                        "Select when this crop was harvested (within the last year)"
                      )}
                    </small>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="form-section">
                <h3 className="section-title">{t("📍 Pickup Location")}</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      {t("State")} <span className="required">*</span>
                    </label>
                    {createAutocomplete(
                      "state-autocomplete",
                      stateOptions,
                      formData.state,
                      (value) =>
                        handleInputChange("state")({ target: { value } }),
                      t("Search and select state..."),
                      false,
                      t("No states found")
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="city" className="form-label">
                      {t("City")} <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      className="form-control modern-input"
                      placeholder={t("Enter city name")}
                      onChange={handleInputChange("city")}
                      value={formData.city}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="zipcode" className="form-label">
                      {t("Pin Code")} <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="zipcode"
                      className="form-control modern-input"
                      placeholder={t("Enter 6-digit pin code")}
                      onChange={handleInputChange("zipcode")}
                      value={formData.zipcode}
                      pattern="[1-9][0-9]{5}"
                      maxLength="6"
                      inputMode="numeric"
                      title={t(
                        "Enter a valid 6-digit Indian pincode (first digit cannot be 0)"
                      )}
                      required
                    />
                    {formData.zipcode &&
                      formData.zipcode.length > 0 &&
                      formData.zipcode.length < 6 && (
                        <small className="pincode-hint">
                          {6 - formData.zipcode.length} {t("more digit")}
                          {6 - formData.zipcode.length !== 1 ? "s" : ""}{" "}
                          {t("required")}
                        </small>
                      )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address" className="form-label">
                    {t("Detailed Address")} <span className="required">*</span>
                  </label>
                  <textarea
                    id="address"
                    className="form-control modern-textarea"
                    rows="3"
                    placeholder={t(
                      "Enter complete pickup address with landmarks"
                    )}
                    onChange={handleInputChange("address")}
                    value={formData.address}
                    required
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="form-section">
                <h3 className="section-title">{t("📸 Product Image")}</h3>

                <div className="form-group">
                  <label htmlFor="image" className="form-label">
                    {t("Upload Product Photo")}{" "}
                    <span className="required">*</span>
                  </label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      id="image"
                      className="file-input"
                      onChange={handleFileChange}
                      accept="image/*"
                      required
                    />
                    <label htmlFor="image" className="file-upload-label">
                      <div className="file-upload-content">
                        <div className="upload-icon">📷</div>
                        <div className="upload-text">
                          <span className="upload-main">
                            {t("Choose product image")}
                          </span>
                          <span className="upload-sub">
                            {t("PNG, JPG up to 10MB")}
                          </span>
                        </div>
                      </div>
                    </label>
                    {image.image && (
                      <div className="file-selected">✅ {image.image.name}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-section">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className={`submit-btn ${load ? "loading" : ""}`}
                  disabled={load}
                >
                  {load ? (
                    <div className="btn-loading">
                      <Spinner animation="border" size="sm" />
                      <span>{t("Adding Product...")}</span>
                    </div>
                  ) : (
                    <div className="btn-content">
                      <span>{t("Add Product")} </span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
