import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Request.css";
import { Table, Spinner, Button, Alert, Container, Badge } from "react-bootstrap";
import { baseUrl } from "../../../baseUrl";
import { useHistory } from "react-router-dom";
import Header from "../../headerComponent";
import Footer from "../../footerComponent";
import { Token } from "../../../utils/utils";

// Constants
const REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
};

const STATUS_DISPLAY = {
  [REQUEST_STATUS.PENDING]: { variant: 'warning', text: 'Pending' },
  [REQUEST_STATUS.ACCEPTED]: { variant: 'success', text: 'Approved' },
  [REQUEST_STATUS.REJECTED]: { variant: 'danger', text: 'Rejected' }
};

export default function Request() {
  const history = useHistory();
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    sellerId: ""
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

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
        sellerId: parts[3] || ""
      };
    } catch (error) {
      console.error("Error parsing token:", error);
      return null;
    }
  }, []);

  // Initialize component
  useEffect(() => {
    const user = getUserInfo();
    if (!user) {
      history.push("/");
      return;
    }
    
    setUserInfo(user);
    fetchRequests();
  }, [history, getUserInfo]);

  // Fetch requests from server
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(`${baseUrl}/allRequests`, { token });
      
      if (response.data.status) {
        setRequests(response.data.message || []);
      } else {
        setError(response.data.message || "Failed to fetch requests");
        setRequests([]);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle approve/deny actions
  const handleRequestAction = useCallback(async (requestId, action) => {
    try {
      setActionLoading(prev => ({ ...prev, [requestId]: true }));
      setError("");
      setSuccessMessage("");
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const requestData = {
        token,
        id: requestId,
        decision: action
      };

      const response = await axios.post(`${baseUrl}/ApproveOrDeny`, requestData);
      
      if (response.data.status) {
        setSuccessMessage(`Request ${action.toLowerCase()}d successfully`);
        // Refresh requests to show updated status
        await fetchRequests();
      } else {
        setError(response.data.message || `Failed to ${action.toLowerCase()} request`);
      }
    } catch (err) {
      console.error(`Error ${action.toLowerCase()}ing request:`, err);
      setError(err.response?.data?.message || err.message || `Failed to ${action.toLowerCase()} request`);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  }, [fetchRequests]);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Render loading state
  if (loading) {
    return (
      <div className="App-request">
        <Header />
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading requests...</p>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="App-request">
      <Header />
      <div className="App-header">
        <Container className="request-container">
          <div className="request-title">
            <h2>My Requests</h2>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={fetchRequests} 
              disabled={loading}
              className="refresh-button"
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")} className="mt-3">
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {successMessage && (
            <Alert variant="success" dismissible onClose={() => setSuccessMessage("")} className="mt-3">
              {successMessage}
            </Alert>
          )}

          {/* Requests Table */}
          {requests.length > 0 ? (
            <Table striped bordered hover variant="dark" className="request-table mt-4">
              <thead>
                <tr>
                  <th>S No.</th>
                  <th>Buyer Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request, index) => {
                  const status = request.status || REQUEST_STATUS.PENDING;
                  const statusConfig = STATUS_DISPLAY[status] || STATUS_DISPLAY[REQUEST_STATUS.PENDING];
                  const isActionLoading = actionLoading[request._id];
                  
                  return (
                    <tr key={request._id || index}>
                      <td>{index + 1}</td>
                      <td>{request.buyerName || request.BuyerName || "Unknown Buyer"}</td>
                      <td>
                        <Badge variant={statusConfig.variant}>
                          {statusConfig.text}
                        </Badge>
                      </td>
                      <td>
                        {status === REQUEST_STATUS.PENDING ? (
                          <div className="d-flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleRequestAction(request._id, "Approve")}
                              disabled={isActionLoading}
                              className="action-button"
                            >
                              {isActionLoading ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                "Approve"
                              )}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRequestAction(request._id, "Deny")}
                              disabled={isActionLoading}
                              className="action-button"
                            >
                              {isActionLoading ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                "Deny"
                              )}
                            </Button>
                          </div>
                        ) : (
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.text}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <div className="no-requests mt-4">
              <Alert variant="info" className="text-center">
                <h5>No Requests Found</h5>
                <p className="mb-0">You don't have any buyer requests at the moment.</p>
              </Alert>
            </div>
          )}
        </Container>
      </div>
      <Footer />
    </div>
  );
}
