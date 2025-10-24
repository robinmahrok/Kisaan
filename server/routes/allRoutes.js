import express from "express";

// Import your existing route modules (keeping them as they are)
import loginRoutes from "./loginRoutes.js";
import seedRoutes from "./seedRoutes.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

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
  getSellerDetails,
} = seedRoutes;

// Define endpoints
router.get("/", ping); // GET /api/users
router.post("/signup", signup); // POST /api/users
router.post("/sendOtp", sendOtp); // PUT /api/users/:id
router.post("/verifyOtp", verifyOtp);
router.post("/changePassword", changePassword);
router.post("/login", login);
router.post("/logout", logout);
router.post("/products", authenticateToken, products);
router.post("/uploadFile", uploadFile);
router.post("/addSellerData", authenticateToken, addSellerData);
router.post("/getItemsList", getItemsList);
router.get("/allItems", authenticateToken, allItems);
router.post("/editItems", authenticateToken, editItems);
router.post("/deleteItems", authenticateToken, deleteItems);
router.post("/addRequest", authenticateToken, addRequest);
router.post("/getRequestData", authenticateToken, getRequestData);
router.get("/allRequests", authenticateToken, allRequests);
router.post("/ApproveOrDeny", authenticateToken, ApproveOrDeny);
router.get("/getSellerDetails/:sellerId", authenticateToken, getSellerDetails);

export default router;
