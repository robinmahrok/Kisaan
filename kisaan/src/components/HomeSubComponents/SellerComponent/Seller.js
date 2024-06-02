import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Seller.css";
import { Spinner } from "react-bootstrap";
import { baseUrl } from "../../../baseUrl";
import { useHistory } from "react-router-dom";
import Header from "../../headerComponent/header";
import Footer from "../../footerComponent/footer";
import { Token } from "../../../utils/utils";
import statesofIndia from "../../../utils/states";

export default function Seller() {
  var history = useHistory();
  const [product, setProduct] = useState("");
  const [variety, setVariety] = useState("");
  const [productListState, setProductList] = useState([]);
  const [cityList, setCityList] = useState([]);

  var productList = [];
  const [varietyListState, setVarietyList] = useState([]);
  var varietyList = [];
  var prodVardata = {};
  const [quantity, setQuantity] = useState("");
  const [Email, setEmail] = useState("");
  const [Name, setName] = useState("");
  const [Contact, setContact] = useState();
  const [price, setPrice] = useState(false);
  const [address, setAddress] = useState("");
  const [image, setImage] = useState({ image: null });
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [load, setLoad] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [otherVariety, setOtherVariety] = useState("");




  useEffect(() => {
    if (localStorage.getItem("token")) {
      var token = localStorage.getItem("token");
      var nameEmail = Token(token);

      var name = nameEmail.split(",")[0];
      var userId = nameEmail.split(",")[1];
      var contact = nameEmail.split(",")[2];
      setEmail(userId);
      setName(name);
      setContact(contact);
      var data = {
        token: localStorage.getItem("token"),
      };

      axios
        .post(baseUrl + "/products", data)
        .then((response) => {
          if (response.data.status) {
            JSON.stringify(response.data.message);
            prodVardata = response.data.message;
            localStorage.setItem("prodVarData", JSON.stringify(prodVardata));
            Object.entries(prodVardata).map(([key, value]) => {
              productList.push(key);
            });
            setProductList(productList);
          } else {
            alert(response.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
          alert(err);
        });
    } else history.push("/");
  }, []);

  const handleOnChangeProduct = (e) => {
    e.preventDefault();
    var prodVar = localStorage.getItem("prodVarData");
    var prodVarObj = JSON.parse(prodVar);
    Object.entries(prodVarObj).map(([key, value]) => {
      if (e.target.value == key) {
        Object.entries(value[0]).map(([k, v]) => {
          varietyList.push(v);
        });
      }
    });
    console.log(varietyList)
    varietyList.push("Other")
    setVarietyList(varietyList);
    setProduct(e.target.value);
  };

  const handleOnChangeVariety = (e) => {
    e.preventDefault();
    if (e.target.value == "Other") {
      setShowOther(true);
      setVariety("")
      console.log("show other true")
    }
    else {
      setShowOther(false)
      setVariety(e.target.value);
    }
  };

  const handleOnChangeOtherVariety = (e) => {
    e.preventDefault();
    setVariety(e.target.value);
  };

  const handleOnChangeState = (e) => {
    e.preventDefault();
    setState(e.target.value);
    // axios.get("https://citystate.herokuapp.com/cities?State_like="+e.target.value).then((response=>{
    // var checkres=[];
    // for(var i=0;i<response.data.length-1;i++)
    // {
    //   if(response.data[i].City!=response.data[i+1].City)
    //   checkres.push(response.data[i].City)
    // }
    // setCityList(checkres)
    // }))

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
      var img = e.target.files[0];

      setImage({ image: img });
    }
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    setLoad(true);
    var token = localStorage.getItem("token");
    var nameEmail = Token(token);
    var sellerId = nameEmail.split(",")[3];
    var data = {
      SellerId: sellerId,
      Name: Name,
      Email: Email,
      Contact: Contact,
      Product: product,
      Variety: variety,
      Quantity: quantity,
      State: state,
      City: city,
      Pin: zipcode,
      Address: address,
      Price: price,
      token: localStorage.getItem("token"),
    };
    var validate = true;
    Object.entries(data).map(([k, v]) => {
      if (v == "")
        validate = false;
    });
    if (validate == false) {
      alert("All fields are mandatory!!")
      setLoad(false);
    }
    else {
      validate = true;
      axios
        .post(baseUrl + "/addSellerData", data)
        .then((response) => {
          setLoad(false);
          if (response.data.status) {
            var id = response.data.message;
            const formData = new FormData();
            if (image.image != null) {
              formData.append("file", image.image);
              formData.append("fileName", id);

              fetch(baseUrl + "/uploadFile", {
                method: "POST",
                body: formData,
              })
                .then((res) => {
                  if (res.status == 200) {
                    alert("Your data is successfully saved");
                    setLoad(false);
                    history.push('/home')
                  } else {
                    alert("Can not update the data");
                    setLoad(false);
                  }
                })
                .catch((err) => {
                  alert(err);
                  setLoad(false);
                });
            }
            else alert("Please add any image first")
          } else {
            alert(response.data.message);
          }
        })
        .catch((err) => {
          alert(err);
          setLoad(false);
        });
    }
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
            <h2>Seller</h2>

            <div>
              <label>Select Your Product : </label> &nbsp;
              <select
                className="blue"
                defaultValue={"first"}
                onChange={handleOnChangeProduct}
                required
              >
                <option value="first" hidden disabled>
                  [Please select any one]
                </option>
                {productListState.map((list, i) => (
                  <option key={i} value={list}>
                    {list}
                  </option>
                ))}
              </select>
              <br />
              <br />
              <label>Select Your Variety : </label>&nbsp;
              <select
                className="blue"
                defaultValue="def"
                onChange={handleOnChangeVariety}
                required
              >
                <option value="def" hidden disabled>
                  [Please select any one]
                </option>
                {varietyListState.map((list, i) => (
                  <option key={i} value={list}>
                    {list}
                  </option>
                ))}


              </select>
              {
                showOther && <div style={{ "paddingLeft": "130px" }}>
                  <input
                    type="text"
                    style={{ borderRadius: "7px" }}
                    placeholder="Enter Other Variety"
                    onChange={handleOnChangeOtherVariety}
                    value={variety}
                    name="otherVariety"
                    required={true}
                  />{" "}
                </div>
              }
              {!showOther && <br />}
              <br />
              <label>Enter Quantity (in Kgs) : </label> &nbsp;
              <input
                type="number"
                style={{ borderRadius: "7px" }}
                placeholder="Enter Quantity"
                onChange={handleOnChangeQuantity}
                value={quantity}
                name="quantity"
                required
              />{" "}
              <br />
              <br />
              <label>Enter Price (per kg) : </label> &nbsp;
              <input
                type="number"
                style={{ borderRadius: "7px" }}
                placeholder="Enter Price"
                onChange={handleOnChangePrice}
                value={price}
                name="price"
                required
              />{" "}
              <br />
              <br />
              <label>Enter Complete Pickup Address: </label> &nbsp;
              <br />
              <div className="border1">

                <label>State : </label> &nbsp;
                <select
                  className="blue"
                  defaultValue="def"
                  onChange={handleOnChangeState}
                  required
                >
                  <option value="def" hidden disabled>
                    [Please select any one]
                  </option>
                  {statesofIndia.map((list, i) => (
                    <option key={i} value={list.name}>
                      {list.name}
                    </option>
                  ))}
                </select> &nbsp;&nbsp;
                <label>City : </label> &nbsp;
                <input
                  className="city"
                  defaultValue=""
                  onChange={handleOnChangeCity}
                  required
                />
                {/* <option value="def" hidden disabled>
                  [Please select any one]
                </option>
                {cityList && cityList.map((list, i) => (
                  <option key={i} value={list}>
                    {list}
                  </option>
                ))}
              </select> &nbsp;&nbsp; */}
                <label>Zip Code : </label> &nbsp;
                <input
                  style={{ borderRadius: "7px" }}
                  type="number"
                  min="100000"
                  max="999999"
                  name="zip"
                  onChange={handleOnChangeZip}
                  value={zipcode}
                  required
                />{" "}
                <br />
                <br />
                <label>Enter Town/Village : </label> &nbsp;
                <textarea
                  style={{ borderRadius: "7px" }}
                  name="address"
                  onChange={handleOnChangeAddress}
                  value={address}
                  required
                />{" "}
              </div>
              <br />
              <br />
              <label>Upload Image of Seed : </label> &nbsp;
              <input
                type="file"
                style={{ borderRadius: "7px" }}
                onChange={handleOnChangeFile}
                required={true}
              />{" "}
              <br />
              <br />
              <button
                style={{ marginLeft: "20%" }}
                className="btn btn-primary button"
                onClick={handleOnSubmit}
              >
                {!load && <span>Submit</span>}
                {load && (
                  <Spinner animation="border" variant="primary"></Spinner>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}
