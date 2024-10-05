import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Buyer.css";
import { baseUrl } from "../../../baseUrl";
import { useHistory } from "react-router-dom";
import Header from "../../headerComponent";
import Footer from "../../footerComponent";
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
  const history = useHistory();
  const [sellerData, setsellerData] = useState([]);
  const [imageLink, setImageLink] = useState();
  const [productListState, setProductList] = useState([]);
  const [myId, setMyId] = useState("");

  const [nullItems, setnullItems] = useState(true);
  const [Email, setEmail] = useState("");
  const [Name, setName] = useState("");
  const [Contact, setContact] = useState();
  const [followSeller, setFollowSeller] = useState("");
  const [showSeller, setShowSeller] = useState(false);

  const [current, setCurrent] = useState(0);
  const PER_PAGE = 10;
  const offset = current * PER_PAGE;
  const currentPageData = productListState.slice(offset, offset + PER_PAGE);
  const pageCount = Math.ceil(productListState.length / PER_PAGE);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      const token = localStorage.getItem("token");
      const nameEmail = Token(token);
      const [name, userId, contact, id] = nameEmail.split(",");

      setEmail(userId);
      setName(name);
      setContact(contact);
      setMyId(id);
      const data = { token: localStorage.getItem("token") };

      axios
        .post(baseUrl + "/getItemsList", data)
        .then((response) => {
          if (response.data.status) {
            setImageLink(baseUrl + "/static/images/");
            const prodVardata = response.data.message;
            if (!prodVardata.length) {
              setnullItems(true);
            } else {
              setnullItems(false);
              const productList = prodVardata.filter(item => item.SellerId !== id);
              setProductList(productList);
            }
          } else {
            alert(response.data.message);
          }
        })
        .catch((err) => {
          console.error(err);
          alert(err);
        });
    } else {
      history.push("/");
    }
  }, [history]);

  const handlePageClick = ({ selected: selectedPage }) => {
    setCurrent(selectedPage);
  };

  const viewDetails = (e, id) => {
    e.preventDefault();
    setsellerData("");
    const selectedSeller = productListState.find(item => item._id === id);
    setsellerData(selectedSeller);
    setShowSeller(prev => !prev);

    const token = localStorage.getItem("token");
    const nameEmail = Token(token);
    const buyerId = nameEmail.split(",")[3];
    const data = {
      sellerId: selectedSeller.SellerId,
      buyerId: buyerId,
      token: token,
      buyerName: nameEmail.split(",")[0],
      sellerName: selectedSeller.SellerName,
    };
    axios.post(baseUrl + "/getRequestData", data).then((response) => {
      if (response.data.status === false) {
        setFollowSeller("Follow");
      } else {
        const statusMap = {
          "-1": "Declined",
          "0": "Requested",
          "1": "Following",
        };
        setFollowSeller(statusMap[response.data.message]);
      }
    });
  };

  const connectSeller = (e) => {
    const token = localStorage.getItem("token");
    const nameEmail = Token(token);
    const buyerId = nameEmail.split(",")[3];
    const data = {
      sellerId: sellerData.SellerId,
      buyerId: buyerId,
      token: token,
      buyerName: nameEmail.split(",")[0],
      sellerName: sellerData.SellerName,
    };
    axios.post(baseUrl + "/getRequestData", data).then((response) => {
      if (response.data.status === false) {
        axios.post(baseUrl + "/addRequest", data).then((response) => {
          alert(response.data.message || response.data?.message);
        });
      } else {
        const statusMap = {
          "-1": "Declined",
          "0": "Requested",
          "1": "Following",
        };
        setFollowSeller(statusMap[response.data.message]);
      }
    });
  };

  return (
    <div className="App-buyer">
      <Header />
      <div className="App-header">
        {nullItems && (
          <Typography variant="h5" component="h2" className="no-items">
            No items Found
          </Typography>
        )}
        <Container fixed>
          <Grid container spacing={2}>
            {!nullItems && currentPageData.map((itemDetail) => (
              <Grid item xs={12} sm={6} md={4} key={itemDetail._id}>
                <Card className="product-card">
                  <CardContent>
                    <CardMedia
                      image={`${imageLink}${itemDetail._id}.jpg`} 
                      title="Image is missing"
                      component="img"
                      height="150"
                    />
                    <Typography variant="h6" component="h2" className="product-title">
                      Product: {itemDetail.Product}
                    </Typography>
                    <Typography variant="body1">Variety: {itemDetail.Variety}</Typography>
                    <Typography variant="body1">Quantity: {itemDetail.Quantity} Kgs</Typography>
                    <Typography variant="body1">Price: Rs. {itemDetail.Price} per Kg</Typography>
                    {(!showSeller || itemDetail._id !== sellerData._id) && (
                      <Button
                        size="medium"
                        variant="contained"
                        color="primary"
                        onClick={(e) => viewDetails(e, itemDetail._id)}
                        className="view-details-button"
                      >
                        Get Details of Seller
                      </Button>
                    )}
                    {showSeller && itemDetail._id === sellerData._id && (
                      <div className="seller-details">
                        <Typography variant="body2">Seller's Name: {sellerData.Name}</Typography>
                        <Typography variant="body2">Seller's Email: {sellerData.Email}</Typography>
                        <Typography variant="body2">Seller's Contact: {sellerData.Contact}</Typography>
                        <Typography variant="body2">Pickup Address:</Typography>
                        <div className="pickup-address">
                          <p>State: {sellerData.State}</p>
                          <p>City: {sellerData.City}</p>
                          <p>Pin: {sellerData.Pin}</p>
                          <p>Address: {sellerData.Address}</p>
                        </div>
                        <Button
                          size="medium"
                          variant="contained"
                          color="primary"
                          onClick={(e) => connectSeller(e)}
                          className="connect-button"
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
        {!nullItems && (
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
        )}
      </div>
      <Footer />
    </div>
  );
}
