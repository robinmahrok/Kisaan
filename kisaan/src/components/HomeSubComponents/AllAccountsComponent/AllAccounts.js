import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./AllAccounts.css";
import {
  Spinner,
  Alert,
  Button,
  Container,
  Badge,
  Card,
} from "react-bootstrap";
import { Autocomplete } from "@material-ui/lab";
import { TextField } from "@material-ui/core";
import { cloudinaryUrl } from "../../../baseUrl";
import { useHistory } from "react-router-dom";
import Header from "../../headerComponent";
import Footer from "../../footerComponent";
import { Token } from "../../../utils/utils";
import statesofIndia from "../../../utils/states";
import { useTranslate } from "../../../hooks/useTranslate";
import { itemService } from "../../../services";
import { getAuthToken } from "../../../utils/cookies";
import AuthRequiredModal from "../../common/AuthRequiredModal";

export default function AllAccounts() {
  const history = useHistory();
  const { t } = useTranslate();
  const [formData, setFormData] = useState({
    price: "",
    quantity: "",
    contact: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
  });
  const [data2, setData2] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  // Memoized state options
  const stateOptions = useMemo(
    () => statesofIndia.map((state) => state.name),
    []
  );

  // Helper function to get user info from token
  const getUserInfo = useCallback(() => {
    const token = getAuthToken();
    if (!token) {
      setShowAuthModal(true);
    } else {
      try {
        const nameEmail = Token(token);
        if (!nameEmail) {
          setShowAuthModal(true);
          return null;
        }

        const parts = nameEmail.split(",");
        return {
          name: parts[0] || "",
          email: parts[1] || "",
          contact: parts[2] || "",
          sellerId: parts[3] || "",
        };
      } catch (error) {
        console.error("Error parsing token:", error);
        return null;
      }
    }
  }, []);

  // Initialize component
  useEffect(() => {
    getUserInfo();
    fetchItems();
  }, [history, getUserInfo]);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch items from server
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const result = await itemService.getAllItems();

      if (result.success && result.data.status) {
        const items = result.data.message || [];
        setData2(items);

        // Initialize action loading states
        const loadingStates = {};
        items.forEach((_, index) => {
          loadingStates[index] = false;
        });
        setActionLoading(loadingStates);
      } else {
        setError(
          result.error || result.data?.message || "Failed to fetch items"
        );
        setData2([]);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      setError(err.message || "Failed to fetch items");
      setData2([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input changes
  const handleInputChange = useCallback(
    (field) => (e) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (error) setError("");
    },
    [error]
  );

  // Handle edit button click
  const handleEdit = useCallback(
    (index) => {
      setEditingIndex(index);
      const item = data2[index];
      if (item) {
        setFormData({
          price: item.price?.value || item.Price || "",
          quantity: item.quantity?.value || item.Quantity || "",
          contact: item.contact || item.Contact || "",
          street: item.address?.street || item.Address || "",
          city: item.address?.city || "",
          state: item.address?.state || "",
          pinCode: item.address?.pinCode || "",
        });
      }
      setError("");
    },
    [data2]
  );

  // Handle save button click
  const handleSave = useCallback(
    async (index) => {
      try {
        // Validation
        if (formData.contact.length !== 10) {
          setError("Contact number must be exactly 10 digits");
          return;
        }

        if (
          !formData.price ||
          !formData.quantity ||
          !formData.street ||
          !formData.city ||
          !formData.state ||
          !formData.pinCode
        ) {
          setError("All fields are required");
          return;
        }

        if (
          formData.pinCode.length !== 6 ||
          !/^\d{6}$/.test(formData.pinCode)
        ) {
          setError("Pin code must be exactly 6 digits");
          return;
        }

        setActionLoading((prev) => ({ ...prev, [index]: true }));
        setError("");
        setSuccessMessage("");

        const item = data2[index];
        const requestData = {
          id: item._id,
          price: formData.price,
          quantity: formData.quantity,
          contact: formData.contact,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pinCode: formData.pinCode,
          },
        };

        const result = await itemService.editItem(requestData);

        if (result.success && result.data.status) {
          setSuccessMessage("Item updated successfully!");
          setEditingIndex(-1);
          setFormData({
            price: "",
            quantity: "",
            contact: "",
            street: "",
            city: "",
            state: "",
            pinCode: "",
          });
          await fetchItems();
        } else {
          setError(
            result.error || result.data?.message || "Failed to update item"
          );
        }
      } catch (err) {
        console.error("Error updating item:", err);
        setError(err.message || "Failed to update item");
      } finally {
        setActionLoading((prev) => ({ ...prev, [index]: false }));
      }
    },
    [formData, data2, fetchItems]
  );

  // Handle delete button click
  const handleDelete = useCallback(
    async (index) => {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this item? This action cannot be undone."
      );
      if (!confirmDelete) return;

      try {
        setActionLoading((prev) => ({ ...prev, [index]: true }));
        setError("");
        setSuccessMessage("");

        const item = data2[index];
        const requestData = {
          id: item._id,
        };

        const result = await itemService.deleteItem(requestData);

        if (result.success && result.data.status) {
          setSuccessMessage("Item deleted successfully!");
          await fetchItems();
        } else {
          setError(
            result.error || result.data?.message || "Failed to delete item"
          );
        }
      } catch (err) {
        console.error("Error deleting item:", err);
        setError(err.message || "Failed to delete item");
      } finally {
        setActionLoading((prev) => ({ ...prev, [index]: false }));
      }
    },
    [data2, fetchItems]
  );

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingIndex(-1);
    setFormData({
      price: "",
      quantity: "",
      contact: "",
      street: "",
      city: "",
      state: "",
      pinCode: "",
    });
    setError("");
  }, []);

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

  // Render loading state
  if (loading) {
    return (
      <div className="App-items">
        <Header />
        <Container className="loading-container">
          <div className="loading-content">
            <Spinner animation="border" variant="primary" />
            <h5 className="loading-text">{t("Loading your items...")}</h5>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="App-items">
      <Header />
      <AuthRequiredModal
        show={showAuthModal}
        onHide={() => {
          setShowAuthModal(false);
          history.push("/");
        }}
      />
      <div className="App-header">
        <Container>
          <div className="header-section">
            <h2 className="page-title">{t("My Products")}</h2>
            <div className="header-actions">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={fetchItems}
                disabled={loading}
                className="refresh-button"
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  t("Refresh")
                )}
              </Button>
            </div>
          </div>

          {/* Success Alert */}
          {successMessage && (
            <Alert
              variant="success"
              dismissible
              onClose={() => setSuccessMessage("")}
              className="alert-message"
            >
              <strong>✅{t("Success:")}</strong> {t(`${successMessage}`)}
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError("")}
              className="alert-message"
            >
              <strong>⚠️{t("Error:")}</strong> {t(`${error}`)}
            </Alert>
          )}

          {/* Items Display */}
          {data2.length > 0 ? (
            <div className="items-grid">
              {data2.map((item, index) => (
                <Card key={item._id || index} className="item-card">
                  <div className="item-image-container">
                    {console.log(`${cloudinaryUrl}${item._id}.jpg`)}
                    <img
                      src={`${cloudinaryUrl}${item._id}.jpg`}
                      alt={item.product || item.Product}
                      className="item-image"
                      onError={(e) => {
                        e.target.src = "/logo192.png";
                      }}
                    />
                  </div>

                  <Card.Body className="item-content">
                    <div className="item-header">
                      <h3 className="item-title">
                        {item.product || item.Product}
                      </h3>
                      <Badge variant="info" className="variety-badge">
                        {item.variety || item.Variety}
                      </Badge>
                    </div>

                    <div className="item-details">
                      {editingIndex === index ? (
                        // Edit Mode
                        <div className="edit-form">
                          <div className="form-group">
                            <label className="form-label">
                              {t("Price (₹/Kg)")}
                            </label>
                            <input
                              type="number"
                              className="form-control modern-input"
                              value={formData.price}
                              onChange={handleInputChange("price")}
                              placeholder={t("Enter price")}
                              min="0"
                              step="0.01"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">
                              {t("Quantity (Kg)")}
                            </label>
                            <input
                              type="number"
                              className="form-control modern-input"
                              value={formData.quantity}
                              onChange={handleInputChange("quantity")}
                              placeholder={t("Enter quantity")}
                              min="0"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">
                              {t("Contact Number")}
                            </label>
                            <input
                              type="tel"
                              className="form-control modern-input"
                              value={formData.contact}
                              onChange={handleInputChange("contact")}
                              placeholder={t("Enter 10-digit contact number")}
                              maxLength="10"
                              pattern="[0-9]{10}"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">
                              {t("Street Address")}
                            </label>
                            <input
                              type="text"
                              className="form-control modern-input"
                              value={formData.street}
                              onChange={handleInputChange("street")}
                              placeholder={t("Enter street address")}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">{t("City")}</label>
                            <input
                              type="text"
                              className="form-control modern-input"
                              value={formData.city}
                              onChange={handleInputChange("city")}
                              placeholder={t("Enter city")}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">{t("State")}</label>
                            {createAutocomplete(
                              "state-autocomplete",
                              stateOptions,
                              formData.state,
                              (value) =>
                                handleInputChange("state")({
                                  target: { value },
                                }),
                              t("Search and select state..."),
                              false,
                              "No states found"
                            )}
                          </div>

                          <div className="form-group">
                            <label className="form-label">
                              {t("Pin Code")}
                            </label>
                            <input
                              type="text"
                              className="form-control modern-input"
                              value={formData.pinCode}
                              onChange={handleInputChange("pinCode")}
                              placeholder={t("Enter 6-digit pin code")}
                              maxLength="6"
                              pattern="[0-9]{6}"
                            />
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="item-info">
                          <div className="detail-row">
                            <span className="detail-label">{t("Price:")}</span>
                            <span className="detail-value price">
                              ₹{item.price?.value || item.Price}/
                              {item.price?.unit || "Kg"}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">
                              {t("Quantity:")}
                            </span>
                            <span className="detail-value">
                              {item.quantity?.value || item.Quantity}{" "}
                              {item.quantity?.unit || "Kg"}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">
                              {t("Contact:")}
                            </span>
                            <span className="detail-value">
                              {item.contact || item.Contact}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">
                              {t("Address:")}
                            </span>
                            <span className="detail-value address-text">
                              {item.address?.street || item.Address}
                              {item.address?.city && `, ${item.address.city}`}
                              {item.address?.state && `, ${item.address.state}`}
                            </span>
                          </div>
                          {item.address?.pinCode && (
                            <div className="detail-row">
                              <span className="detail-label">
                                {t("Pin Code:")}
                              </span>
                              <span className="detail-value">
                                {item.address.pinCode}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="item-actions">
                      {editingIndex === index ? (
                        <div className="edit-actions">
                          <Button
                            variant="success"
                            onClick={() => handleSave(index)}
                            disabled={actionLoading[index]}
                            className="save-button"
                          >
                            {actionLoading[index] ? (
                              <>
                                <Spinner
                                  animation="border"
                                  size="sm"
                                  className="button-spinner"
                                />
                                {t("Saving...")}
                              </>
                            ) : (
                              t("Save Changes")
                            )}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={handleCancelEdit}
                            disabled={actionLoading[index]}
                            className="cancel-button"
                          >
                            {t("Cancel")}
                          </Button>
                        </div>
                      ) : (
                        <div className="view-actions">
                          <Button
                            variant="primary"
                            onClick={() => handleEdit(index)}
                            disabled={actionLoading[index]}
                            className="edit-button"
                          >
                            {t("Edit Details")}
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(index)}
                            disabled={actionLoading[index]}
                            className="delete-button"
                          >
                            {actionLoading[index] ? (
                              <>
                                <Spinner
                                  animation="border"
                                  size="sm"
                                  className="button-spinner"
                                />
                                {t("Deleting...")}
                              </>
                            ) : (
                              t("Delete")
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <div className="no-items">
              <Alert variant="info" className="no-items-alert">
                <h5>📦 {t("No Products Found")}</h5>
                <p className="mb-0">
                  {t(
                    "You haven't added any products yet. Start by adding your first product to reach potential buyers!"
                  )}
                </p>
                <Button
                  variant="outline-info"
                  onClick={() => history.push("/seller")}
                  className="mt-3 add-product-button"
                >
                  {t("+ Add Your First Product")}
                </Button>
              </Alert>
            </div>
          )}
        </Container>
      </div>
      <Footer />
    </div>
  );
}
