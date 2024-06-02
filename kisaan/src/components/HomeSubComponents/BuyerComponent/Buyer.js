import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Buyer.css";
import { baseUrl } from "../../../baseUrl";
import { useHistory } from "react-router-dom";
import Header from "../../headerComponent/header";
import Footer from "../../footerComponent/footer";
import { Token } from "../../../utils/utils";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import ReactPaginate from "react-paginate";

export default function Buyer() {
  var history = useHistory();
  const [sellerData, setsellerData] = useState([]);
  const [imageLink, setImageLink] = useState();
  const [productListState, setProductList] = useState([]);
  const [myId, setMyId] = useState("");

  var productList = [];
  const [nullItems, setnullItems] = useState(false);
  var prodVardata = {};
  const [Email, setEmail] = useState("");
  const [Name, setName] = useState("");
  const [Contact, setContact] = useState();
  const [followSeller, setFollowSeller] = useState("");
  const [showSeller, setShowSeller] = useState(false);

  const [current, setCurrent] = useState(0);
  const PER_PAGE = 2;
  const offset = current * PER_PAGE;
  const currentPageData = productListState
    .slice(offset, offset + PER_PAGE)
  const pageCount = Math.ceil(productListState.length / PER_PAGE);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      var token = localStorage.getItem("token");
      var nameEmail = Token(token);

      var name = nameEmail.split(",")[0];
      var userId = nameEmail.split(",")[1];
      var contact = nameEmail.split(",")[2];
      var id = nameEmail.split(",")[3];

      setEmail(userId);
      setName(name);
      setContact(contact);
      setMyId(id);
      var data = {
        token: localStorage.getItem("token"),
      };
      axios
        .post(baseUrl + "/getItemsList", data)
        .then((response) => {
          if (response.data.status) {
            JSON.stringify(response.data.message);
            if (response.data.message == "") {
              setnullItems(true);
            } else {
              setnullItems(false);
              setImageLink(baseUrl + "/static/images/");
              prodVardata = response.data.message;
              Object.entries(prodVardata).map(([key, value]) => {
                if (value.SellerId != id) {
                  productList.push(value);
                }
              });
              setProductList(productList);
            }
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

  function handlePageClick({ selected: selectedPage }) {
    setCurrent(selectedPage);
  }


  const viewDetails = (e, id) => {
    e.preventDefault();
    setsellerData("");
    var s;
    Object.entries(productListState).map(([key, value]) => {
      if (value._id == id) {
        s = value;
      }
    });
    setsellerData(s);
    if (showSeller)
      setShowSeller(false);
    else
      setShowSeller(true);

    var token = localStorage.getItem("token");
    var nameEmail = Token(token);
    var buyerId = nameEmail.split(",")[3];
    var data = {
      sellerId: s.SellerId,
      buyerId: buyerId,
      token: token,
      buyerName: nameEmail.split(",")[0],
      sellerName: s.SellerName,
    };
    axios.post(baseUrl + "/getRequestData", data).then((response) => {
      if (response.data.status == false) {
        setFollowSeller("Follow");
      }
      else {
        if (response.data.message == "-1") {
          setFollowSeller("Declined");
        } else if (response.data.message == "0") {
          setFollowSeller("Requested");
        } else if (response.data.message == "1") {
          setFollowSeller("Following");
        }
      }
    })
  }
  const connectSeller = (e, id) => {
    var token = localStorage.getItem("token");
    var nameEmail = Token(token);
    var buyerId = nameEmail.split(",")[3];
    var data = {
      sellerId: sellerData.SellerId,
      buyerId: buyerId,
      token: token,
      buyerName: nameEmail.split(",")[0],
      sellerName: sellerData.SellerName,
    };
    axios.post(baseUrl + "/getRequestData", data).then((response) => {
      if (response.data.status == false) {
        axios.post(baseUrl + "/addRequest", data).then((response) => {
          if (response.data.status) {
            alert(response.data.message);
          } else console.log(response.data.message);
        });
      }
      else {
        if (response.data.message == "-1") {
          setFollowSeller("Declined");
        } else if (response.data.message == "0") {
          setFollowSeller("Requested");
        } else if (response.data.message == "1") {
          setFollowSeller("Following");
        }
      }
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
        {nullItems == true && (
          <Typography variant="h5" component="h2">
            No items Found
          </Typography>
        )}
        <Container fixed>
          <Grid container spacing={2}>
            {nullItems == false &&
              currentPageData.map((itemDetail) => (
                <Grid item xs={6} md={4} key={itemDetail._id}>
                  <Card
                    style={{
                      width: 350,
                      backgroundColor: "lightgray",
                    }}
                  >
                    <CardContent>
                      <CardMedia
                        image={imageLink + itemDetail._id + ".jpg"} // require image
                        title="Image is missing"
                        component="img"
                        height="150"
                      />
                      <br/>
                      <Typography variant="body1" component="h2">
                        Product- {itemDetail.Product}
                      </Typography>
                      <Typography
                        style={{
                          marginBottom: 5,
                        }}
                        color="textSecondary"
                      ></Typography>
                      <Typography variant="body1" component="h2">
                        Variety- {itemDetail.Variety}
                      </Typography>
                      <Typography
                        style={{
                          marginBottom: 5,
                        }}
                        color="textSecondary"
                      ></Typography>
                      <Typography variant="body1" component="h2">
                        Quantity- {itemDetail.Quantity} Kgs
                      </Typography>
                      <Typography
                        style={{
                          marginBottom: 5,
                        }}
                        color="textSecondary"
                      ></Typography>
                      <Typography variant="body1">
                        Price- Rs.{itemDetail.Price} per Kg
                      </Typography>
                      <Typography
                        style={{
                          marginBottom: 5,
                        }}
                        color="textSecondary"
                      ></Typography>
                     {(!showSeller || itemDetail._id != sellerData._id) &&  <Button
                        size="medium"
                        variant="contained"
                        color="primary"
                        onClick={(e) => viewDetails(e, itemDetail._id)}
                      >
                        Get Details of seller
                      </Button>}
                      {showSeller && itemDetail._id == sellerData._id && (
                        <div>
                          <Typography
                            style={{
                              marginBottom: 4,
                            }}
                            color="textSecondary"
                          ></Typography>
                          <Typography variant="body2">
                            Seller's Name- {sellerData.Name}
                          </Typography>
                          <Typography
                            style={{
                              marginBottom: 4,
                            }}
                            color="textSecondary"
                          ></Typography>
                          <Typography variant="body2">
                            Seller's Email- {sellerData.Email}
                          </Typography>
                          <Typography
                            style={{
                              marginBottom: 4,
                            }}
                            color="textSecondary"
                          ></Typography>
                          <Typography variant="body2">
                            Seller's Contact- {sellerData.Contact}
                          </Typography>
                          <Typography
                            style={{
                              marginBottom: 4,
                            }}
                            color="textSecondary"
                          ></Typography>
                          <Typography variant="body2" component={"div"}>
                            Pickup Address- <br />
                            <div className="border1">
                              State- {sellerData.State}
                              <br />
                              City- {sellerData.City}
                              <br />
                              Pin- {sellerData.Pin}
                              <br />
                              Address- {sellerData.Address}
                            </div>
                          </Typography>
                          <br/>
                          <Button
                            size="medium"
                            variant="contained"
                            color="primary"
                            onClick={(e) => connectSeller(e, itemDetail._id)}
                          >
                            {followSeller}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Container>
        {nullItems == false  && <ReactPaginate
          previousLabel={"← Previous"}
          nextLabel={"Next →"}
          pageCount={pageCount}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
          previousLinkClassName={"pagination__link"}
          nextLinkClassName={"pagination__link"}
          disabledClassName={"pagination__link--disabled"}
          activeClassName={"pagination__link--active"}
        />}
      </div>
      <Footer></Footer>
    </div>
  );
}
