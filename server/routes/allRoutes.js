import express from "express";

// Import your existing route modules (keeping them as they are)
import loginRoutes from "./loginRoutes.js";
import seedRoutes from "./seedRoutes.js";
import utils from "../controllers/utils.js";

const router = express.Router();

// Custom middleware to authenticate token from request body
const authenticateFromBody = (req, res, next) => {
  try {
    const token = req.body.token;

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Access token required",
      });
    }

    const user = utils.authenticateToken(token);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      status: false,
      message: "Invalid or expired token",
    });
  }
};

const { ping, signup, sendOtp, verifyOtp, changePassword, login, logout } =
  loginRoutes;

const {
  products,
  uploadFile,
  addSellerData,
  getItemsList,
  allItems,
  editItems,
  deleteItems,
  addRequest,
  getRequestData,
  allRequests,
  ApproveOrDeny,
} = seedRoutes;

// Define endpoints
router.get("/", ping); // GET /api/users
router.post("/signup", signup); // POST /api/users
router.post("/sendOtp", sendOtp); // PUT /api/users/:id
router.post("/verifyOtp", verifyOtp);
router.post("/changePassword", changePassword);
router.post("/login", login);
router.post("/logout", logout);
router.post("/products", authenticateFromBody, products);
router.post("/uploadFile", uploadFile);
router.post("/addSellerData", authenticateFromBody, addSellerData);
router.post("/getItemsList", authenticateFromBody, getItemsList);
router.post("/allItems", authenticateFromBody, allItems);
router.post("/editItems", authenticateFromBody, editItems);
router.post("/deleteItems", authenticateFromBody, deleteItems);
router.post("/addRequest", authenticateFromBody, addRequest);
router.post("/getRequestData", authenticateFromBody, getRequestData);
router.post("/allRequests", authenticateFromBody, allRequests);
router.post("/ApproveOrDeny", authenticateFromBody, ApproveOrDeny);

export default router;
