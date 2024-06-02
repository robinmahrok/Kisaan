import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AllAccounts.css";
import { Table, Spinner } from "react-bootstrap";
import { baseUrl } from "../../../baseUrl";
import { useHistory } from "react-router-dom";
import Header from "../../headerComponent/header";
import Footer from "../../footerComponent/footer";
import { Token } from "../../../utils/utils";

export default function AllAccounts() {
  var history = useHistory();

  const [Name, setName] = useState("");
  const [Email, setEmail] = useState("");
  const [price, setPrice] = useState();
  const [quantity, setQuantity] = useState();
  const [contact, setContact] = useState();
  const [address, setAddress] = useState("");


  const [data2, setData2] = useState();
  const [index, setIndex] = useState();


  const [prompt, setPrompt] = useState(-1);

  const [load, setLoad] = useState(false);
  const [loadEdit, setLoadEdit] = useState({});


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

  const handleOnChangeContact = (e) => {
    e.preventDefault();
    setContact(e.target.value);
  };

  const handleEdit = (e, id) => {
    e.preventDefault();
    let edit = loadEdit;
    edit[id] = false;
    setLoadEdit(edit)
    setIndex(id);
    var keyValue;
    data2.map((key, value) => {
      if (value === id)
        keyValue = key;
    })
    setAddress(keyValue.Address);
    setQuantity(keyValue.Quantity);
    setPrice(keyValue.Price);
    setContact(keyValue.Contact);


  }

  const handleDelete = (e, id) => {
    e.preventDefault();
    setIndex(id);
    const confirmBox = window.confirm(
      "Do you really want to delete this field"
    )
    if (confirmBox === true) {
      var keyValue;
      data2.map((key, value) => {
        if (value === id)
          keyValue = key;
      })
      var data = {
        token: localStorage.getItem("token"),
        id: keyValue._id
      }
      axios
        .post(baseUrl + "/deleteItems", data)
        .then((response) => {
          if (response.data.status) {
            if (response.data.message != null) {
              alert("Data is Deleted");
              GetItems();
            }
            else {
              alert(response?.data?.message)
            }
          } else {
            alert(response.data.status)

          }
        })
        .catch((err) => {
          console.log(err);
        });

    }
  }

  const handleSave = (e, id) => {
    e.preventDefault();
    let edit = loadEdit;
    edit[id] = true;
    setLoadEdit(edit)
    setIndex(id);
    var keyValue;
    data2.map((key, value) => {
      if (value === id)
        keyValue = key;
    })
    if (contact.length != 10) {
      alert("wrong contact")
    }
    else {
      var data = {
        token: localStorage.getItem("token"),
        id: keyValue._id,
        price: price,
        quantity: quantity,
        contact: contact,
        address: address
      }
      axios
        .post(baseUrl + "/editItems", data)
        .then((response) => {
          if (response.data.status) {
            if (response?.data?.message != null) {
              alert("Data is Updated");
              GetItems();
            }
            else {alert(response?.data?.message)}
          } else {
            alert(response?.data?.status)

          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  const GetItems = () => {
    setLoad(true)
    axios
      .post(baseUrl + "/allItems", { token: localStorage.getItem("token") })
      .then((response) => {
        setLoad(false);
        if (response.data.status) {
          if (response.data.message.length != 0) {
            let edit = {}
            for (let i = 0; i < response.data.message.length; i++) {
              edit[i] = true
            }
            setLoadEdit(edit)

            setData2(response.data.message);
            setPrompt(1);
          }
          else setPrompt(0)
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
    <div className="App">
      <Header></Header>
      <div className="App-header">
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
          crossOrigin="anonymous"
        />
        <div>
          <form>
            <h2>My Items &nbsp;
              {!load && <button className="btn btn-primary" onClick={GetItems}>
              Refresh
            </button>}
              {load && (
                <Spinner animation="border" variant="primary"></Spinner>
              )}
              </h2>


            {prompt == 1 && (
              <div>

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
                        <td><input type="text" style={{ "width": "100px", "color": "black" }} value={listValue.Product} disabled={true} /></td>
                        <td><input type="text" style={{ "width": "100px", "color": "black" }} value={listValue.Variety} disabled={true} /></td>
                        <td><input type="number" style={{ "width": "100px", "color": "black" }} onChange={handleOnChangePrice} defaultValue={listValue.Price} disabled={i != index || loadEdit[i]} /></td>
                        <td><input type="number" style={{ "width": "100px", "color": "black" }} onChange={handleOnChangeQuantity} defaultValue={listValue.Quantity} disabled={i != index || loadEdit[i]} /></td>
                        <td><input type="number" style={{ "width": "150px", "color": "black" }} onChange={handleOnChangeContact} defaultValue={listValue.Contact} disabled={i != index || loadEdit[i]} /></td>
                        <td><textarea style={{ "width": "150px", "color": "black" }} onChange={handleOnChangeAddress} defaultValue={listValue.Address} disabled={i != index || loadEdit[i]}></textarea></td>
                        <td>
                          {loadEdit[i] && <button id={i} className="btn btn-info" onClick={(e) => handleEdit(e, i)}>
                            Edit
                          </button>}
                          {!loadEdit[i] && <button id={i} className="btn btn-info" onClick={(e) => handleSave(e, i)}>
                            Save
                          </button>} &nbsp;
                          <button className="btn btn-danger" id={i} onClick={(e) => handleDelete(e, i)} >
                            Delete
                          </button> </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
            {prompt == 0 && (
              <div style={{ "paddingTop": "10px" }}>
                <h6>No Items Found</h6>
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}
