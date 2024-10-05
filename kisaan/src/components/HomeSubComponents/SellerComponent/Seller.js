import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Seller.css";
import { Spinner, Form, Button, Alert } from "react-bootstrap";
import { baseUrl } from "../../../baseUrl";
import { useHistory } from "react-router-dom";
import Header from "../../headerComponent";
import Footer from "../../footerComponent";
import { Token } from "../../../utils/utils";
import statesofIndia from "../../../utils/states";

export default function Seller() {
  const history = useHistory();
  const [product, setProduct] = useState("");
  const [variety, setVariety] = useState("");
  const [productListState, setProductList] = useState([]);
  const [varietyListState, setVarietyList] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState({ image: null });
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [load, setLoad] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [otherVariety, setOtherVariety] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const nameEmail = Token(token);
      const name = nameEmail.split(",")[0];
      const userId = nameEmail.split(",")[1];
      const contact = nameEmail.split(",")[2];
      setEmail(userId);
      setName(name);
      setContact(contact);

      axios.post(baseUrl + "/products", { token })
        .then((response) => {
          if (response.data.status) {
            const prodVarData = response.data.message;
            localStorage.setItem("prodVarData", JSON.stringify(prodVarData));
            setProductList(Object.keys(prodVarData));
          } else {
            setErrorMessage(response.data.message);
          }
        })
        .catch((err) => {
          console.error(err);
          setErrorMessage(err.message);
        });
    } else {
      history.push("/");
    }
  }, [history]);

  const handleOnChangeProduct = (e) => {
    e.preventDefault();
    const prodVar = JSON.parse(localStorage.getItem("prodVarData"));
    const selectedProduct = e.target.value;
    const varieties = prodVar[selectedProduct][0];
    
    setVarietyList(Object.values(varieties));
    setVarietyList((prev) => [...prev, "Other"]);
    setProduct(selectedProduct);
  };

  const handleOnChangeVariety = (e) => {
    e.preventDefault();
    const selectedVariety = e.target.value;
    setVariety(selectedVariety);
    setShowOther(selectedVariety === "Other");
  };

  const handleOnChangeOtherVariety = (e) => {
    e.preventDefault();
    setVariety(e.target.value);
  };

  const handleOnChangeState = (e) => {
    e.preventDefault();
    setState(e.target.value);
    // You may want to fetch cities based on the selected state here
  };

  const handleOnChangeCity = (e) => {
    e.preventDefault();
    setCity(e.target.value);
  };

  const handleOnChangeZip = (e) => {
    e.preventDefault();
    setZipcode(e.target.value);
  };

  const handleOnChangeQuantity = (e) => {
    e.preventDefault();
    setQuantity(e.target.value);
  };

  const handleOnChangePrice = (e) => {
    e.preventDefault();
    setPrice(e.target.value);
  };

  const handleOnChangeAddress = (e) => {
    e.preventDefault();
    setAddress(e.target.value);
  };

  const handleOnChangeFile = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setImage({ image: e.target.files[0] });
    }
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setLoad(true);
    const token = localStorage.getItem("token");
    const sellerId = Token(token).split(",")[3];
    
    const data = {
      SellerId: sellerId,
      Name: name,
      Email: email,
      Contact: contact,
      Product: product,
      Variety: variety,
      Quantity: quantity,
      State: state,
      City: city,
      Pin: zipcode,
      Address: address,
      Price: price,
      token,
    };

    const isValid = Object.values(data).every((field) => field);
    if (!isValid) {
      setErrorMessage("All fields are mandatory!");
      setLoad(false);
      return;
    }
    
    try {
      const response = await axios.post(baseUrl + "/addSellerData", data);
      if (response.data.status) {
        const id = response.data.message;
        if (image.image) {
          const formData = new FormData();
          formData.append("file", image.image);
          formData.append("fileName", id);

          const uploadResponse = await fetch(baseUrl + "/uploadFile", {
            method: "POST",
            body: formData,
          });

          if (uploadResponse.status === 200) {
            alert("Your data is successfully saved");
            history.push('/home');
          } else {
            setErrorMessage("Could not upload the image.");
          }
        } else {
          setErrorMessage("Please add an image first.");
        }
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="App-seller">
      <Header />
      <div className="App-header">
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
          crossOrigin="anonymous"
        />
        <div>
          <h2 className="text-center mb-4">Seller Dashboard</h2>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form onSubmit={handleOnSubmit} className="form">
            <Form.Group>
              <Form.Label>Select Your Product:</Form.Label>
              <Form.Control as="select" onChange={handleOnChangeProduct} required>
                <option value="" hidden>[Please select any one]</option>
                {productListState.map((list, i) => (
                  <option key={i} value={list}>{list}</option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group>
              <Form.Label>Select Your Variety:</Form.Label>
              <Form.Control as="select" onChange={handleOnChangeVariety} required>
                <option value="" hidden>[Please select any one]</option>
                {varietyListState.map((list, i) => (
                  <option key={i} value={list}>{list}</option>
                ))}
              </Form.Control>
              {showOther && (
                <Form.Control
                  type="text"
                  placeholder="Enter Other Variety"
                  onChange={handleOnChangeOtherVariety}
                  value={variety}
                  required
                />
              )}
            </Form.Group>

            <Form.Group>
              <Form.Label>Enter Quantity (in Kgs):</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Quantity"
                onChange={handleOnChangeQuantity}
                value={quantity}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Enter Price (per kg):</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Price"
                onChange={handleOnChangePrice}
                value={price}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Enter Complete Pickup Address:</Form.Label>
              <Form.Row>
                <Form.Group as={Form.Col}>
                  <Form.Label>State:</Form.Label>
                  <Form.Control as="select" onChange={handleOnChangeState} required>
                    <option value="" hidden>[Please select any one]</option>
                    {statesofIndia.map((list, i) => (
                      <option key={i} value={list.name}>{list.name}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group as={Form.Col}>
                  <Form.Label>City:</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={handleOnChangeCity}
                    value={city}
                    required
                  />
                </Form.Group>
                <Form.Group as={Form.Col}>
                  <Form.Label>Zip Code:</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={handleOnChangeZip}
                    value={zipcode}
                    required
                  />
                </Form.Group>
              </Form.Row>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Detailed Address"
                onChange={handleOnChangeAddress}
                value={address}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Upload Image:</Form.Label>
              <Form.Control
                type="file"
                onChange={handleOnChangeFile}
                accept="image/*"
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={load}>
              {load ? <Spinner animation="border" size="sm" /> : "Submit"}
            </Button>
          </Form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
