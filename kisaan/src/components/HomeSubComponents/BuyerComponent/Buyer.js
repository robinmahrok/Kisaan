import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Buyer.css";
import { baseUrl } from "../../../baseUrl";
import { useHistory } from "react-router-dom";
import Header from "../../headerComponent";
import Footer from "../../footerComponent";
import { Token } from "../../../utils/utils";
import { Spinner, Alert, Button, Container, Badge } from "react-bootstrap";
import ReactPaginate from "react-paginate";

// Constants
const REQUEST_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

const STATUS_DISPLAY = {
  [REQUEST_STATUS.PENDING]: { variant: "warning", text: "Requested" },
  [REQUEST_STATUS.ACCEPTED]: { variant: "success", text: "Following" },
  [REQUEST_STATUS.REJECTED]: { variant: "danger", text: "Declined" },
};

const SORT_OPTIONS = [
  { value: "createdAt", label: "Latest First", order: "desc" },
  { value: "createdAt", label: "Oldest First", order: "asc" },
  { value: "price", label: "Price: Low to High", order: "asc" },
  { value: "price", label: "Price: High to Low", order: "desc" },
  { value: "quantity", label: "Quantity: Low to High", order: "asc" },
  { value: "quantity", label: "Quantity: High to Low", order: "desc" },
  { value: "harvestDate", label: "Harvest Date: Recent", order: "desc" },
  { value: "harvestDate", label: "Harvest Date: Oldest", order: "asc" },
];

export default function Buyer() {
  const history = useHistory();
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    contact: "",
    buyerId: "",
  });
  const [sellerData, setSellerData] = useState(null);
  const [imageLink, setImageLink] = useState("");
  const [productListState, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [nullItems, setNullItems] = useState(true);
  const [followSeller, setFollowSeller] = useState("");
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filter and Search States
  const [filters, setFilters] = useState({
    search: "",
    state: "",
    city: "",
    product: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  const [current, setCurrent] = useState(0);
  const PER_PAGE = 9;
  const offset = current * PER_PAGE;
  const currentPageData = productListState.slice(offset, offset + PER_PAGE);
  const pageCount = Math.ceil(productListState.length / PER_PAGE);

  // Helper function to get user info from token
  const getUserInfo = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const nameEmail = Token(token);
      if (!nameEmail) return null;

      const parts = nameEmail.split(",");
      return {
        name: parts[0] || "",
        email: parts[1] || "",
        contact: parts[2] || "",
        buyerId: parts[3] || "",
      };
    } catch (error) {
      console.error("Error parsing token:", error);
      return null;
    }
  }, []);

  // Initialize user info
  useEffect(() => {
    const user = getUserInfo();
    if (!user) {
      history.push("/");
      return;
    }
    setUserInfo(user);
  }, [history, getUserInfo]);

  // Fetch products list with filters
  const fetchProductsList = useCallback(
    async (searchFilters) => {
      try {
        setSearchLoading(true);
        setError("");

        const user = getUserInfo();
        if (!user) {
          history.push("/");
          return;
        }

        // Use current filters if no searchFilters provided
        const filtersToUse = searchFilters || filters;

        const requestData = {
          token: localStorage.getItem("token"),
          search: filtersToUse.search || "",
          state: filtersToUse.state || "",
          city: filtersToUse.city || "",
          product: filtersToUse.product || "",
          minPrice: filtersToUse.minPrice ? Number(filtersToUse.minPrice) : 0,
          maxPrice: filtersToUse.maxPrice
            ? Number(filtersToUse.maxPrice)
            : Number.MAX_SAFE_INTEGER,
          sortBy: filtersToUse.sortBy || "createdAt",
          sortOrder: filtersToUse.sortOrder || "desc",
        };

        console.log("Sending request with filters:", requestData);

        const response = await axios.post(
          `${baseUrl}/getItemsList`,
          requestData
        );

        if (response.data.status) {
          setImageLink(`${baseUrl}/static/images/`);
          const products = response.data.message || [];
          setTotalCount(response.data.totalCount || products.length);

          if (products.length === 0) {
            setNullItems(true);
            setProductList([]);
          } else {
            setNullItems(false);
            setProductList(products);
          }

          // Reset pagination to first page when filters change
          setCurrent(0);
        } else {
          setError(response.data.message || "Failed to fetch products");
          setNullItems(true);
          setProductList([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
        setNullItems(true);
        setProductList([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    },
    [history, getUserInfo]
  );

  // Initial load
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      history.push("/");
      return;
    }
    fetchProductsList();
  }, [history]); // Remove fetchProductsList from dependencies

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Debounce search input to avoid too many API calls
    if (key === "search") {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        fetchProductsList(newFilters);
      }, 500); // 500ms delay

      setDebounceTimer(timer);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchProductsList(filters);
  };

  // Handle clear filters
  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      state: "",
      city: "",
      product: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setFilters(clearedFilters);
    fetchProductsList(clearedFilters);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const selectedOption = SORT_OPTIONS.find(
      (option) => `${option.value}-${option.order}` === e.target.value
    );
    if (selectedOption) {
      const newFilters = {
        ...filters,
        sortBy: selectedOption.value,
        sortOrder: selectedOption.order,
      };
      setFilters(newFilters);
      // Call API immediately with new filters
      fetchProductsList(newFilters);
    }
  };

  const handlePageClick = ({ selected: selectedPage }) => {
    setCurrent(selectedPage);
    setShowModal(false);
    setSellerData(null);
  };

  const viewDetails = async (e, id) => {
    e.preventDefault();

    try {
      const selectedSeller = productListState.find((item) => item._id === id);
      if (!selectedSeller) return;

      setSellerData(selectedSeller);
      setShowModal(true);
      setLoadingRequest(true);

      const data = {
        sellerId: selectedSeller.sellerId,
        buyerId: userInfo.buyerId,
        token: localStorage.getItem("token"),
        buyerName: userInfo.name,
        sellerName: selectedSeller.name,
      };

      const response = await axios.post(`${baseUrl}/getRequestData`, data);

      if (response.data.status === false) {
        setFollowSeller("Follow");
      } else {
        const statusMap = {
          rejected: "Declined",
          pending: "Requested",
          accepted: "Following",
        };
        setFollowSeller(statusMap[response.data.message] || "Follow");
      }
    } catch (err) {
      console.error("Error fetching seller details:", err);
      setFollowSeller("Follow");
    } finally {
      setLoadingRequest(false);
    }
  };

  const connectSeller = async (e) => {
    e.preventDefault();

    if (!sellerData || loadingRequest) return;

    try {
      setLoadingRequest(true);
      setError("");
      setSuccessMessage("");

      const data = {
        sellerId: sellerData.sellerId,
        buyerId: userInfo.buyerId,
        token: localStorage.getItem("token"),
        buyerName: userInfo.name,
        buyerEmail: userInfo.email,
        buyerContact: userInfo.contact,
        sellerName: sellerData.name,
      };

      const response = await axios.post(`${baseUrl}/getRequestData`, data);

      if (response.data.status === false) {
        // Send new request
        const addResponse = await axios.post(`${baseUrl}/addRequest`, data);
        setSuccessMessage("Request sent successfully!");
        setFollowSeller("Requested");
      } else {
        const statusMap = {
          rejected: "Declined",
          pending: "Requested",
          accepted: "Following",
        };
        const currentStatus = statusMap[response.data.message];
        setFollowSeller(currentStatus || "Follow");

        if (currentStatus === "Following") {
          setSuccessMessage("You are already following this seller!");
        } else if (currentStatus === "Requested") {
          setSuccessMessage("Request already sent!");
        } else if (currentStatus === "Declined") {
          setError("Your previous request was declined.");
        }
      }
    } catch (err) {
      console.error("Error connecting to seller:", err);
      setError("Failed to connect with seller. Please try again.");
    } finally {
      setLoadingRequest(false);
    }
  };

  if (loading && !searchLoading) {
    return (
      <div className="App-buyer">
        <Header />
        <Container className="loading-container">
          <div className="loading-content">
            <Spinner animation="border" variant="primary" />
            <h5 className="loading-text">Loading products...</h5>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="App-buyer">
      <Header />
      <div className="App-header">
        <Container>
          <div className="header-section">
            <h2 className="page-title">Available Products</h2>
            <div className="header-actions">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => fetchProductsList()}
                disabled={searchLoading}
                className="refresh-button"
              >
                {searchLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div
            className={`search-filter-section ${showFilters ? "expanded" : ""}`}
          >
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-row">
                <div className="search-input-group">
                  <input
                    type="text"
                    placeholder="Search products, varieties..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="search-input"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={searchLoading}
                    className="search-button"
                  >
                    {searchLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      "Search"
                    )}
                  </Button>
                </div>

                <div className="sort-group">
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={handleSortChange}
                    className="sort-select"
                  >
                    {SORT_OPTIONS.map((option, index) => (
                      <option
                        key={index}
                        value={`${option.value}-${option.order}`}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="filter-toggle-button"
                  >
                    {showFilters ? "Hide Filters" : "+Show Filters"}
                  </Button>
                </div>
              </div>

              {showFilters && (
                <div className="filters-grid">
                  <div className="filter-group">
                    <label>Product Type</label>
                    <input
                      type="text"
                      placeholder="e.g., Rice, Wheat, Tomato"
                      value={filters.product}
                      onChange={(e) =>
                        handleFilterChange("product", e.target.value)
                      }
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <label>State</label>
                    <input
                      type="text"
                      placeholder="e.g., Punjab, Maharashtra"
                      value={filters.state}
                      onChange={(e) =>
                        handleFilterChange("state", e.target.value)
                      }
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <label>City</label>
                    <input
                      type="text"
                      placeholder="e.g., Mumbai, Delhi"
                      value={filters.city}
                      onChange={(e) =>
                        handleFilterChange("city", e.target.value)
                      }
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <label>Min Price (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.minPrice}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                      className="filter-input"
                      min="0"
                    />
                  </div>

                  <div className="filter-group">
                    <label>Max Price (₹)</label>
                    <input
                      type="number"
                      placeholder="No limit"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                      className="filter-input"
                      min="0"
                    />
                  </div>

                  <div className="filter-actions">
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={clearFilters}
                      className="clear-filters-button"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Results Summary */}
          {!nullItems && (
            <div className="results-summary">
              <span className="results-count">
                Showing {currentPageData.length} of {totalCount} products
              </span>
              {(filters.search ||
                filters.state ||
                filters.city ||
                filters.product ||
                filters.minPrice ||
                filters.maxPrice) && (
                <span className="active-filters">• Filters applied</span>
              )}
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <Alert
              variant="success"
              dismissible
              onClose={() => setSuccessMessage("")}
              className="alert-message"
            >
              {successMessage}
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
              {error}
              <Button
                variant="outline-danger"
                onClick={() => fetchProductsList()}
                className="retry-button"
                size="sm"
              >
                Retry
              </Button>
            </Alert>
          )}

          {nullItems && !loading && !searchLoading ? (
            <Alert variant="info" className="no-products-alert">
              <h5>No Products Found</h5>
              <p>
                {filters.search ||
                filters.state ||
                filters.city ||
                filters.product ||
                filters.minPrice ||
                filters.maxPrice
                  ? "No products match your search criteria. Try adjusting your filters."
                  : "There are no products available at the moment. Please check back later."}
              </p>
              {(filters.search ||
                filters.state ||
                filters.city ||
                filters.product ||
                filters.minPrice ||
                filters.maxPrice) && (
                <Button
                  variant="outline-info"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              )}
            </Alert>
          ) : (
            <>
              <div className="products-grid">
                {currentPageData.map((itemDetail) => (
                  <div key={itemDetail._id} className="product-card">
                    <div className="product-image-container">
                      <img
                        src={`${imageLink}${itemDetail._id}.jpg`}
                        alt={itemDetail.product}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = "/logo192.png";
                        }}
                      />
                      <Badge variant="success" className="availability-badge">
                        Available
                      </Badge>
                    </div>

                    <div className="product-content">
                      <div className="product-header">
                        <h3 className="product-title">{itemDetail.product}</h3>
                      </div>

                      <div className="product-details">
                        <div className="detail-row">
                          <span className="detail-label">Variety:</span>
                          <span className="detail-value">
                            {itemDetail.variety}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Quantity:</span>
                          <span className="detail-value">
                            {itemDetail.quantity?.value}{" "}
                            {itemDetail.quantity?.unit}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Price:</span>
                          <span className="detail-value price">
                            ₹{itemDetail.price?.value}/{itemDetail.price?.unit}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Harvest Date:</span>
                          <span className="detail-value">
                            {new Date(
                              itemDetail.harvestDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">
                            {itemDetail.address?.city},{" "}
                            {itemDetail.address?.state}
                          </span>
                        </div>
                      </div>

                      <div className="product-actions">
                        <Button
                          variant="primary"
                          onClick={(e) => viewDetails(e, itemDetail._id)}
                          className="view-details-button"
                        >
                          View Seller Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pageCount > 1 && (
                <div className="pagination-container">
                  <ReactPaginate
                    previousLabel={"← Previous"}
                    nextLabel={"Next →"}
                    pageCount={pageCount}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination"}
                    previousLinkClassName={"pagination__link"}
                    nextLinkClassName={"pagination__link"}
                    disabledClassName={"pagination__link--disabled"}
                    activeClassName={"pagination__link--active"}
                  />
                </div>
              )}
            </>
          )}
        </Container>
      </div>

      {/* Custom Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="modal-title">Seller Details</h4>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {sellerData && (
                <div className="seller-modal-content">
                  <div className="modal-grid">
                    <div className="modal-section">
                      <h6 className="section-title">Product Information</h6>
                      <div className="info-section">
                        <p>
                          <strong>Product:</strong> {sellerData.product}
                        </p>
                        <p>
                          <strong>Variety:</strong> {sellerData.variety}
                        </p>
                        <p>
                          <strong>Quantity:</strong>{" "}
                          {sellerData.quantity?.value}{" "}
                          {sellerData.quantity?.unit}
                        </p>
                        <p>
                          <strong>Price:</strong> ₹{sellerData.price?.value}/
                          {sellerData.price?.unit}
                        </p>
                        <p>
                          <strong>Harvest Date:</strong>{" "}
                          {new Date(
                            sellerData.harvestDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="modal-section">
                      <h6 className="section-title">Seller Information</h6>
                      <div className="info-section">
                        <p>
                          <strong>Name:</strong> {sellerData.name}
                        </p>
                        <p>
                          <strong>Email:</strong> {sellerData.email}
                        </p>
                        <p>
                          <strong>Contact:</strong> {sellerData.contact}
                        </p>
                      </div>

                      <h6 className="section-title">Pickup Address</h6>
                      <div className="info-section address-section">
                        <p>{sellerData.address?.street}</p>
                        <p>
                          {sellerData.address?.city},{" "}
                          {sellerData.address?.state}
                        </p>
                        <p>PIN: {sellerData.address?.pinCode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <Button
                variant="success"
                onClick={connectSeller}
                disabled={loadingRequest}
                className="connect-button"
              >
                {loadingRequest ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      className="button-spinner"
                    />
                    Processing...
                  </>
                ) : (
                  followSeller
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="close-button"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
