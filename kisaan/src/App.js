import "./App.css";
import Login from "../src/components/loginComponent/login";
import SignUp from "./components/signUpComponent/signup";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import forgotPassword from "./components/forgotPasswordComponent/forgotPassword";
import OtpVerify from "./components/otpVerifyComponent/otpVerify";
import Home from "./components/homeComponent/home";
import AllAccounts from "./components/HomeSubComponents/AllAccountsComponent/AllAccounts";
import Seller from "./components/HomeSubComponents/SellerComponent/Seller";
import Buyer from "./components/HomeSubComponents/BuyerComponent/Buyer";
import AboutUs from "./components/common/AboutUs";
import ContactUs from "./components/common/ContactUs";
import Request from "./components/HomeSubComponents/RequestComponent/Request";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/signUp" component={SignUp} />
        <Route path="/forgotPassword" component={forgotPassword} />
        <Route path="/otpVerify" component={OtpVerify} />
        <Route path="/home" component={Home} />
        <Route path="/allAccounts" component={AllAccounts} />
        <Route path="/aboutUs" component={AboutUs} />
        <Route path="/ContactUs" component={ContactUs} />
        <Route path="/seller" component={Seller} />
        <Route path="/buyer" component={Buyer} />
        <Route path="/request" component={Request} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
