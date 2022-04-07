import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Request.css";
import { Table, Spinner } from "react-bootstrap";
import { baseUrl } from "../../../baseUrl";
import {  useHistory } from "react-router-dom";
import Header from "../../headerComponent/header";
import Footer from "../../footerComponent/footer";
import Token from "../../../utils/utils";
import Button from "@material-ui/core/Button";

export default function Request() {
  var history = useHistory();

  const [Name, setName] = useState("");
  const [Email, setEmail] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [appOrRej, setAppOrRej] = useState("");


  const [data2, setData2] = useState();
  const [index, setIndex] = useState();


  const [prompt, setPrompt] = useState(-1);

  const [load, setLoad] = useState(false);
  const [loadEdit, setLoadEdit] = useState(true);


  useEffect(() => {
    if (localStorage.getItem("token")) {
      var token = localStorage.getItem("token");
      var nameEmail = Token(token);

      var name = nameEmail.split(",")[0];
      var userId = nameEmail.split(",")[1];
      var Id = nameEmail.split(",")[3];
      setEmail(userId);
      setName(name);
      setSellerId(Id);
      GetRequests();
    } else {
      history.push("/");
    }
  },[]);


  const handleApprove=(e,id)=>{
    e.preventDefault();
    setLoadEdit(false)
    setIndex(id);
    var keyValue;
    
    var targetValue=e.target.value;

    data2.map((key,value)=>
    {
      if(value===id)
     keyValue=key;
  })
  console.log(targetValue)
  var data={
    token: localStorage.getItem("token"),
    id:keyValue._id,
    decision:targetValue
  }
  axios
  .post(baseUrl + "/ApproveOrDeny", data)
  .then((response) => {
    if (response.data.status) {
      if(response.data.message!=null)
      { 
    if(targetValue=="Approve")
          setAppOrRej("Approved")
          else 
          setAppOrRej("Rejected")
          setLoadEdit(false);
      alert("Data is Updated");
      GetRequests();
        // add load to remove buttons
      }
      else console.log(response.data.message)
    } else {
     alert(response.data.status)
  
    }
  })
  .catch((err) => {
    console.log(err);
  });

  }

 
  

  const GetRequests = () => {
    setLoad(true)
    axios
    .post(baseUrl + "/allRequests", { token: localStorage.getItem("token") })
    .then((response) => {
      setLoad(false);
      if (response.data.status) {
        if(response.data.message!=null)
        {
          var resp=response.data.message;
         setData2(response.data.message);
        setPrompt(1);
        }
        else setPrompt(0)
      } else {
        setPrompt(0);
       
      }
    })
    .catch((err) => {
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
            <h2>My Requests &nbsp;<button className="btn btn-primary" onClick={GetRequests}>
                Refresh
                {load && (
                  <Spinner animation="border" variant="primary"></Spinner>
                )}
              </button></h2>
            
              
            {prompt == 1 && (
              <div>
                
                <Table striped bordered hover variant="dark">
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
                        <td>{i+1}</td>
                        <td>{listValue.BuyerName}</td>
                       <td> 
                {listValue.Status==0 && <button className="btn btn-info" value="Approve"  onClick={(e)=>handleApprove(e,i)}>
                Approve
              </button>} &nbsp;
             {
                 listValue.Status==1 && <button className="btn btn-success" disabled={true}>
                 Approved
               </button>
             }
              {
                 listValue.Status==-1 && <button className="btn btn-danger" disabled={true}>
                 Rejected
               </button>
             }
            { listValue.Status==0 && <button className="btn btn-danger" value="Deny" onClick={(e)=>handleApprove(e,i)} >
              Deny
              </button> }</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
            {prompt == 0 && (
              <div>
                <h5>No Requests Found</h5>
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}
