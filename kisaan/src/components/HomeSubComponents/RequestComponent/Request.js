import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Request.css";
import { Table, Spinner, Button } from "react-bootstrap";
import { baseUrl } from "../../../baseUrl";
import { useHistory } from "react-router-dom";
import Header from "../../headerComponent";
import Footer from "../../footerComponent";
import { Token } from "../../../utils/utils";

export default function Request() {
  const history = useHistory();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [data2, setData2] = useState([]);
  const [prompt, setPrompt] = useState(-1);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      const token = localStorage.getItem("token");
      const nameEmail = Token(token);
      const userName = nameEmail.split(",")[0];
      const userId = nameEmail.split(",")[1];
      const Id = nameEmail.split(",")[3];
      setEmail(userId);
      setName(userName);
      setSellerId(Id);
      getRequests();
    } else {
      history.push("/");
    }
  }, [history]);

  const handleApprove = (e, id) => {
    e.preventDefault();
    const targetValue = e.target.value;

    const requestData = {
      token: localStorage.getItem("token"),
      id: data2[id]._id,
      decision: targetValue,
    };

    axios
      .post(baseUrl + "/ApproveOrDeny", requestData)
      .then((response) => {
        if (response.data.status) {
          alert("Data is Updated");
          getRequests();
        } else {
          alert(response.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getRequests = () => {
    setLoad(true);
    axios
      .post(baseUrl + "/allRequests", { token: localStorage.getItem("token") })
      .then((response) => {
        setLoad(false);
        if (response.data.status) {
          setData2(response.data.message);
          setPrompt(response.data.message.length ? 1 : 0);
        } else {
          setPrompt(0);
        }
      })
      .catch((err) => {
        console.log(err);
        setPrompt(0);
        setLoad(false);
      });
  };

  return (
    <div className="App-request">
      <Header />
      <div className="App-header">
        <div className="request-container">
          <h2 className="request-title">
            My Requests 
            <Button variant="primary" onClick={getRequests} disabled={load} className="refresh-button">
              {load ? <Spinner animation="border" size="sm" /> : "Refresh"}
            </Button>
          </h2>

          {prompt === 1 && (
            <Table striped bordered hover variant="dark" className="request-table">
              <thead>
                <tr>
                  <th>S No.</th>
                  <th>Buyers</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data2.map((listValue, i) => (
                  <tr key={i}>
                    <td>{i + 1}.</td>
                    <td>{listValue.BuyerName}</td>
                    <td>
                      {listValue.Status === 0 && (
                        <>
                          <Button variant="info" value="Approve" onClick={(e) => handleApprove(e, i)} className="action-button">
                            Approve
                          </Button>
                          <Button variant="danger" value="Deny" onClick={(e) => handleApprove(e, i)} className="action-button">
                            Deny
                          </Button>
                        </>
                      )}
                      {listValue.Status === 1 && (
                        <Button variant="success" disabled className="action-button">
                          Approved
                        </Button>
                      )}
                      {listValue.Status === -1 && (
                        <Button variant="danger" disabled className="action-button">
                          Rejected
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {prompt === 0 && (
            <div className="no-requests">
              <h6>No Requests Found</h6>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
