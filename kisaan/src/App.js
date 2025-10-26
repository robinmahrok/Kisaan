import React, { Suspense, lazy } from "react";
import "./App.css";
import { BrowserRouter, Switch, Route } from "react-router-dom";

// Lazy load components for better performance
const Login = lazy(() => import("./components/loginComponent/login"));
const SignUp = lazy(() => import("./components/signUpComponent/signup"));
const ForgotPassword = lazy(() =>
  import("./components/forgotPasswordComponent/forgotPassword")
);
const OtpVerify = lazy(() =>
  import("./components/otpVerifyComponent/otpVerify")
);
const Home = lazy(() => import("./components/homeComponent/home"));
const AllAccounts = lazy(() =>
  import("./components/HomeSubComponents/AllAccountsComponent/AllAccounts")
);
const Seller = lazy(() =>
  import("./components/HomeSubComponents/SellerComponent/Seller")
);
const Buyer = lazy(() =>
  import("./components/HomeSubComponents/BuyerComponent/Buyer")
);
const AboutUs = lazy(() => import("./components/common/AboutUs"));
const ContactUs = lazy(() => import("./components/common/ContactUs"));
const Request = lazy(() =>
  import("./components/HomeSubComponents/RequestComponent/Request")
);

// Loading fallback component
const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "1.2rem",
      color: "#4CAF50",
    }}
  >
    <div>Loading...</div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/signUp" component={SignUp} />
          <Route path="/forgotPassword" component={ForgotPassword} />
          <Route path="/otpVerify" component={OtpVerify} />
          <Route path="/home" component={Home} />
          <Route path="/allAccounts" component={AllAccounts} />
          <Route path="/aboutUs" component={AboutUs} />
          <Route path="/ContactUs" component={ContactUs} />
          <Route path="/seller" component={Seller} />
          <Route path="/buyer" component={Buyer} />
          <Route path="/request" component={Request} />
        </Switch>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
