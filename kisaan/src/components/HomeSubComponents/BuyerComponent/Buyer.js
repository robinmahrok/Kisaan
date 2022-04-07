import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Buyer.css";
import { Spinner, Modal } from "react-bootstrap";
import { baseUrl } from "../../../baseUrl";
import { useHistory } from "react-router-dom";
import Header from "../../headerComponent/header";
import Footer from "../../footerComponent/footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Token from "../../../utils/utils";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import  CardMedia  from '@material-ui/core/CardMedia';
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import CardActions from "@material-ui/core/CardActions";
import Grid from "@material-ui/core/Grid"
import  Container  from '@material-ui/core/Container';
import ReactPaginate from 'react-paginate';

export default function Buyer() {
  var history = useHistory();
  const [sellerData, setsellerData] = useState([]);
  const [imageLink, setImageLink] = useState();
  const [productListState, setProductList] = useState([]);
  const [productListPage, setProductListPage] = useState([]);
  const [itemsPerPage, setitemsPerPage] = useState(6);
  var productListpagination=[];

  var productList = [];
  const [nullItems, setnullItems] = useState(false);
  var prodVardata = {};
  const [quantity, setQuantity] = useState("");
  const [Email, setEmail] = useState("");
  const [Name, setName] = useState("");
  const [Contact, setContact] = useState();
  const [showSeller, setShowSeller] = useState(false);
  const [totalItems, setTotalItems] = useState();
  const [pageLimit, setPageLimit] = useState();

  const [pages, setPages] = useState([]);
  const [current, setCurrent] = useState(1);
  
  const [load, setLoad] = useState(false);


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
        .post(baseUrl + "/getItemsList", data)
        .then((response) => {
          if (response.data.status) {
            JSON.stringify(response.data.message);
              if(response.data.message=='')
              {
                setnullItems(true)
              }
             else  {
                setnullItems(false)
                setImageLink(baseUrl+"/static/images/");
            prodVardata = response.data.message;
            setTotalItems(prodVardata.length);
            //pagination start
            if(prodVardata.length%itemsPerPage!=0)
            var pageLimitvar=Math.floor((prodVardata.length/itemsPerPage)+1);
            else var pageLimitvar=Math.floor((prodVardata.length/itemsPerPage));
             
            setPageLimit(pageLimitvar);
            console.log(pageLimitvar)
          let start = Math.floor((current - 1) / pageLimitvar) * pageLimitvar;
           setPages(new Array(pageLimitvar).fill().map((_, idx) => start + idx + 1));
             //pagination end
           Object.entries(prodVardata).map(([key, value]) => {
              productList.push(value);
            });
            setProductList(productList);
            Object.entries(prodVardata).map(([key, value]) => {
            console.log(key);
                if(key<itemsPerPage)
                { 
                    console.log(key);
                    productListpagination.push(value)
                }
              });
              setProductListPage(productListpagination);
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

const goToNextPage=()=> {
    console.log("nex",current)
    
    if(current<totalItems)
    { 
var firstElement,lastElement,lastIndex;

        firstElement=((current+1)*itemsPerPage-itemsPerPage)+1;
        lastIndex=totalItems-(firstElement-1);
        if(lastIndex>itemsPerPage)
        lastElement=(firstElement+itemsPerPage)-1;
        else lastElement=lastIndex+firstElement-1;
   productListState.map((value,index)=>{
       if(index>=firstElement-1 && index<=lastElement-1)
    productListpagination.push(value)
   })
   console.log(productListpagination)
   setProductListPage(productListpagination);
        setCurrent((page) => page + 1);
    }
 }

 const  goToPreviousPage=()=> {
    console.log("prev",current)

     if(current>1)
     {
    var firstElement,lastElement;

        firstElement=((current-1)*itemsPerPage-itemsPerPage)+1;
        lastElement=(firstElement+itemsPerPage)-1;
       productListState.map((value,index)=>{
           console.log(index)
           if(index>=firstElement && index<=lastElement)
        productListpagination.push(value)
       })
       setProductListPage(productListpagination);
    setCurrent((page) => page - 1);

     }


 }

 const  changePage=(e,i)=> {
    e.preventDefault();
    console.log("page ",current)

    if(current<totalItems)
    {
        var firstElement,lastElement, lastIndex;

        firstElement=((i+1)*itemsPerPage-itemsPerPage)+1;
        lastIndex=totalItems-(firstElement-1);
        if(lastIndex>itemsPerPage)
        lastElement=(firstElement+itemsPerPage)-1;
        else lastElement=lastIndex+firstElement-1;

        console.log("first ",firstElement)
        console.log("index ",lastIndex)
        console.log("element ",lastElement)
        console.log(productListpagination)

        Object.entries(productListState).map(([key, value])=>{
            console.log(key)
           if(key>=firstElement-1 && key<=lastElement-1)
            productListpagination.push(value)
       })
       setProductListPage(productListpagination);
    }
    setCurrent(i+1);
 }
  const viewDetails = (e,id) => {
  e.preventDefault();
    setsellerData('');
    var s;
    Object.entries(productListState).map(([key, value]) => {
        if(value._id==id)
        {
            s=value;
        }
    });
    setsellerData(s)
    var token=localStorage.getItem("token");
    var nameEmail = Token(token);
    var buyerId = nameEmail.split(",")[3];
    console.log(s.SellerId)
   var data={
    sellerId:s.SellerId,
    buyerId:buyerId,
    token:token,
    buyerName:nameEmail.split(",")[0],
    sellerName:s.SellerName
    }
axios.post(baseUrl + "/getRequestData", data)
.then((response) => {
  if (response.data.status==false) {
    axios.post(baseUrl + "/addRequest", data)
    .then((response) => {
      if (response.data.status) {
       alert(response.data.message)
      }
      else console.log(response.data.message)

    })
  }
  else if(response.data.message=="-1")
  {
    alert("User has declined your request")
  }
  else if(response.data.message=="0")
  {
    alert("Your Request is already submitted")

  } else if(response.data.message=="1")
  {
    if(showSeller==true)
    setShowSeller(false);
else
    setShowSeller(true);
  }

})
  

   
   

 
   
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
         {nullItems==true &&  <Typography variant="h5" component="h2">
            No items Found
          </Typography>
         
       }
       <Container fixed> 
       <Grid container spacing={2}>
      
      {nullItems==false && productListPage.map(itemDetail =>(
            <Grid item xs={6} md={4} key={itemDetail._id}>
      <Card
        style={{
          width: 350,
          backgroundColor: "lightgray",
        }}
      >
        <CardContent>
    <CardMedia
        image={imageLink+itemDetail._id+".jpg"} // require image
        title="Image is missing"
        component="img"
        height="150"
    />
          <Typography variant="body1"  component="h2">
           Product- {itemDetail.Product}
          </Typography>
          <Typography
            style={{
              marginBottom: 5,
            }}
            color="textSecondary"
          >
          </Typography>
          <Typography variant="body1" component="h2">
           Variety- {itemDetail.Variety}
          </Typography>
          <Typography
            style={{
              marginBottom: 5,
            }}
            color="textSecondary"
          >
          </Typography>
          <Typography variant="body1" component="h2">
           Quantity- {itemDetail.Quantity} Kgs
          </Typography>
          <Typography
            style={{
              marginBottom: 5,
            }}
            color="textSecondary"
          >
          </Typography>
          <Typography variant="body1" >
         Price- Rs.{itemDetail.Price} per Kg
          </Typography>
          <Typography
            style={{
              marginBottom: 5,
            }}
            color="textSecondary"
          >
          </Typography>
          <Button size="medium" variant="contained" color="primary" onClick={(e) => viewDetails(e,itemDetail._id)}>Request Details of seller</Button>
         {showSeller==true && itemDetail._id==sellerData._id &&
         <div>
            <Typography
            style={{
              marginBottom: 4,
            }}
            color="textSecondary"
          >
          </Typography>
          <Typography variant="body2" >
         Seller's Name- {sellerData.Name}
          </Typography>
          <Typography
            style={{
              marginBottom: 4,
            }}
            color="textSecondary"
          >
          </Typography>
          <Typography variant="body2" >
         Seller's Email- {sellerData.Email}
          </Typography>
          <Typography
            style={{
              marginBottom: 4,
            }}
            color="textSecondary"
          >
          </Typography>
          <Typography variant="body2" >
         Seller's Contact- {sellerData.Contact}
          </Typography>
          <Typography
            style={{
              marginBottom: 4,
            }}
            color="textSecondary"
          >
          </Typography>
          <Typography variant="body2" component={'div'} >
          Pickup Address- <br/>
          <div className="border1">
          State- {sellerData.State}
          <br/>
          City- {sellerData.City}
          <br/>
          Pin- {sellerData.Pin}
          <br/>
          Address- {sellerData.Address}

         </div>
          </Typography>
          </div> 
           }
        </CardContent>
        {/* <CardActions  style={{
          backgroundColor: "lightgrey"
        }}>
        </CardActions> */}

      </Card>
      </Grid> 
       ))}
       </Grid>
       </Container>
      {pageLimit>1 && nullItems==false && <div className="pagination">
      <Button size="medium" variant="contained" color="primary" onClick={goToPreviousPage}>prev</Button>
      {pages.map((item, index) => (
        <Button
       // color="secondary" 
          key={index}
          onClick={(e)=>changePage(e,index)}
          className={`paginationItem ${current === item ? 'active' : null}`}
        >
          <span>{item}</span>
        </Button>
      ))}
      <Button size="medium" variant="contained" color="primary" onClick={goToNextPage}>next</Button>
      </div>}

      </div>
      <Footer></Footer>
    </div>
  );
}
