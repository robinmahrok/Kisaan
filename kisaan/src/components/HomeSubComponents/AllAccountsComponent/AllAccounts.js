import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AllAccounts.css"; // Ensure you have the updated CSS file
import { Table, Spinner, Button, Form, Alert } from "react-bootstrap";
import { baseUrl } from "../../../baseUrl";
import { useHistory } from "react-router-dom";
import Header from "../../headerComponent";
import Footer from "../../footerComponent";
import { Token } from "../../../utils/utils";

export default function AllAccounts() {
  var history = useHistory();
  const [Name, setName] = useState("");
  const [Email, setEmail] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [data2, setData2] = useState([]);
  const [index, setIndex] = useState(-1);
  const [prompt, setPrompt] = useState(-1);
  const [load, setLoad] = useState(false);
  const [loadEdit, setLoadEdit] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) {
      var token = localStorage.getItem("token");
      var nameEmail = Token(token);
      var name = nameEmail.split(",")[0];
      var userId = nameEmail.split(",")[1];
      setEmail(userId);
      setName(name);
      GetItems();
    } else {
      history.push("/");
    }
  }, []);

  const handleOnChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleEdit = (e, id) => {
    e.preventDefault();
    const edit = { ...loadEdit, [id]: false };
    setLoadEdit(edit);
    setIndex(id);
    const keyValue = data2[id];
    if (keyValue) {
      setAddress(keyValue.Address);
      setQuantity(keyValue.Quantity);
      setPrice(keyValue.Price);
      setContact(keyValue.Contact);
    }
  };

  const handleDelete = (e, id) => {
    e.preventDefault();
    const confirmBox = window.confirm("Do you really want to delete this field?");
    if (confirmBox) {
      const keyValue = data2[id];
      const data = {
        token: localStorage.getItem("token"),
        id: keyValue._id,
      };
      axios
        .post(baseUrl + "/deleteItems", data)
        .then((response) => {
          if (response.data.status) {
            alert("Data is Deleted");
            GetItems();
          } else {
            alert(response.data.message);
          }
        })
        .catch((err) => console.log(err));
    }
  };

  const handleSave = (e, id) => {
    e.preventDefault();
    const keyValue = data2[id];
    if (contact.length !== 10) {
      setError("Contact number must be 10 digits");
      return;
    }

    const data = {
      token: localStorage.getItem("token"),
      id: keyValue._id,
      price: price,
      quantity: quantity,
      contact: contact,
      address: address,
    };
    axios
      .post(baseUrl + "/editItems", data)
      .then((response) => {
        if (response.data.status) {
          alert("Data is Updated");
          GetItems();
        } else {
          alert(response.data.message);
        }
      })
      .catch((err) => console.log(err));
  };

  const GetItems = () => {
    setLoad(true);
    axios
      .post(baseUrl + "/allItems", { token: localStorage.getItem("token") })
      .then((response) => {
        setLoad(false);
        if (response.data.status) {
          if (response.data.message.length !== 0) {
            const edit = {};
            response.data.message.forEach((_, i) => {
              edit[i] = true;
            });
            setLoadEdit(edit);
            setData2(response.data.message);
            setPrompt(1);
          } else {
            setPrompt(0);
          }
        } else {
          setPrompt(0);
        }
      })
      .catch((err) => {
        setLoad(false);
        console.log(err);
      });
  };

  return (
    <div className="App-items">
      <Header />
      <div className="App-header">
        <div>
          <h2 className="mb-4">
            My Items
            {!load && (
              <Button variant="primary" onClick={GetItems} className="refresh-button">
                Refresh
              </Button>
            )}
            {load && <Spinner animation="border" variant="primary" />}
          </h2>

          {error && <Alert variant="danger">{error}</Alert>}

          {prompt === 1 && (
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>S No.</th>
                  <th>Product</th>
                  <th>Variety</th>
                  <th>Price (per Kg.)</th>
                  <th>Quantity (in Kgs.)</th>
                  <th>Contact Number</th>
                  <th>Address</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data2.map((listValue, i) => (
                  <tr key={i}>
                    <td>{i + 1}.</td>
                    <td>
                      <Form.Control
                        type="text"
                        value={listValue.Product}
                        disabled
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={listValue.Variety}
                        disabled
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={listValue.Price}
                        onChange={handleOnChange(setPrice)}
                        disabled={i !== index || loadEdit[i]}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        value={listValue.Quantity}
                        onChange={handleOnChange(setQuantity)}
                        disabled={i !== index || loadEdit[i]}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={listValue.Contact}
                        onChange={handleOnChange(setContact)}
                        disabled={i !== index || loadEdit[i]}
                      />
                    </td>
                    <td>
                      <Form.Control
                        as="textarea"
                        value={listValue.Address}
                        onChange={handleOnChange(setAddress)}
                        disabled={i !== index || loadEdit[i]}
                      />
                    </td>
                    <td>
                      {loadEdit[i] ? (
                        <Button
                          variant="info"
                          onClick={(e) => handleEdit(e, i)}
                        >
                          Edit
                        </Button>
                      ) : (
                        <Button
                          variant="success"
                          onClick={(e) => handleSave(e, i)}
                        >
                          Save
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        onClick={(e) => handleDelete(e, i)}
                        className="ml-2"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {prompt === 0 && (
            <div style={{ paddingTop: "10px" }}>
              <h6>No Items Found</h6>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
