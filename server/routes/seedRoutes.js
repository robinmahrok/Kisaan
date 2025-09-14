// let express = require("express");
import {
  bank as BankInfo,
  seed as SeedInfo,
  userInfo,
  seller as SellerInfo,
  request as RequestInfo,
} from "../repositories/index.js";
import utils from "../controllers/utils.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ObjectId } from "mongodb";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const { models } = require("mongoose");
// const express = require("express");

export default function (router) {
  router.post("/createAccount", (req, res) => {
    let token = req.body.token;
    let auth = utils.authenticateToken(token);
    if (auth != false) {
      let Email = auth.email.split(",")[1],
        UserId = req.body.userData.id,
        Name = auth.email.split(",")[0],
        Bank = req.body.bankDetails.bankName,
        AccountType = req.body.bankDetails.accountType;
      let AccountNumber = 0;
      BankInfo.countDocuments(
        { UserId: UserId, Bank: Bank, AccountType: AccountType },
        function (err, c) {
          if (c > 0)
            res
              .status(200)
              .send({ status: false, message: "Account Already Created." });
          else {
            BankInfo.countDocuments({}, function (err, c) {
              AccountNumber = c + 1;
              BankInfo.create(
                {
                  Name: Name,
                  UserId: UserId,
                  Email: Email,
                  Bank: Bank,
                  AccountType: AccountType,
                  AccountNumber: AccountNumber,
                },
                function (err, data) {
                  if (!err) {
                    res
                      .status(200)
                      .send({ status: true, message: data.AccountNumber });
                  } else
                    res.status(200).send({
                      status: false,
                      message: "Can not Create Account",
                    });
                }
              );
            });
          }
        }
      );
    } else {
      res.status(200).send({ status: false, message: "Invalid Token" });
    }
  });

  router.post("/products", (req, res) => {
    let token = req.body.token;

    let auth = utils.authenticateToken(token);
    if (auth != false) {
      try {
        // Read crop varieties from JSON file
        const cropVarietiesPath = path.join(
          __dirname,
          "../config/crop_varieties.json"
        );

        const cropVarieties = JSON.parse(
          fs.readFileSync(cropVarietiesPath, "utf8")
        );

        // Transform the data to match the expected format
        const productsData = {};

        Object.keys(cropVarieties).forEach((productName) => {
          const varieties = cropVarieties[productName];

          // Create varieties object with indexed keys
          const varietiesObj = {};
          varieties.forEach((variety, index) => {
            varietiesObj[index] = variety;
          });

          productsData[productName] = [varietiesObj];
        });

        res.status(200).send({
          status: true,
          message: productsData,
        });
      } catch (error) {
        console.error("Error reading crop varieties:", error);
        res.status(200).send({
          status: false,
          message: "Something went wrong",
        });
      }
    } else {
      res.status(200).send({
        status: false,
        message: "Invalid Token",
      });
    }
  });

  router.post("/uploadFile", (req, res) => {
    let imageFile = req.files.file;
    imageFile.mv(
      `./public/images/` + req.body.fileName + `.jpg`,
      function (err) {
        if (err) {
          return res.status(500).send(err);
        } else res.status(200).send({ status: true, message: "working" });
      }
    );
  });

  router.post("/addSellerData", async (req, res) => {
    let token = req.body.token;
    let auth = utils.authenticateToken(token);

    if (auth != false) {
      let email = auth.email.split(",")[1];
      let name = req.body.Name,
        contact = req.body.Contact,
        product = req.body.Product,
        variety = req.body.Variety,
        quantity = req.body.Quantity,
        address = req.body.Address,
        price = req.body.Price,
        state = req.body.State,
        city = req.body.City,
        zip = req.body.Pin,
        sellerId = req.body.SellerId,
        harvestDate = req.body.HarvestDate;

      // Create seller data matching the new schema
      const sellerData = {
        sellerId: sellerId,
        name: name,
        email: email,
        contact: contact,
        product: product,
        variety: variety,
        address: {
          street: address,
          city: city,
          state: state,
          pinCode: zip,
        },
        quantity: {
          value: parseFloat(quantity) || 0,
          unit: "kg", // Default unit, can be made configurable later
        },
        price: {
          value: parseFloat(price) || 0,
          unit: "kg", // Default unit, can be made configurable later
        },
        harvestDate: harvestDate ? new Date(harvestDate) : new Date(), // Parse the date or use current date as fallback
        isAvailable: true,
      };

      try {
        const value = await SellerInfo.create(sellerData);
        // Return the created document ID directly
        res.status(200).send({
          status: true,
          message: value._id || value.id,
        });
      } catch (err) {
        console.error("❌ Error creating seller data:", err);
        console.error("Error details:", err.message);
        if (err.errors) {
          console.error("Validation errors:", err.errors);
        }
        res.status(200).send({
          status: false,
          message: err.message || "Cannot insert value",
        });
      }
    } else {
      console.log("❌ Authentication failed - Invalid Token");
      res.status(200).send({ status: false, message: "Invalid Token" });
    }
  });

  router.post("/getItemsList", async (req, res) => {
    let token = req.body.token;
    let auth = utils.authenticateToken(token);
    if (auth != false) {
      let email = auth.email.split(",")[1];

      // Extract search and filter parameters
      const {
        search = "",
        state = "",
        city = "",
        product = "",
        minPrice = 0,
        maxPrice = Number.MAX_SAFE_INTEGER,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.body;

      try {
        // Build the query filter - exclude current user's items
        let query = {
          email: { $ne: email }, // Use lowercase 'email' field from new schema
          isAvailable: true, // Only show available items
        };

        // Add search filter (search in product name and variety)
        if (search && search.trim()) {
          const searchRegex = new RegExp(search.trim(), "i");
          query.$or = [{ product: searchRegex }, { variety: searchRegex }];
        }

        // Add location filters
        if (state && state.trim()) {
          query["address.state"] = new RegExp(state.trim(), "i");
        }

        if (city && city.trim()) {
          query["address.city"] = new RegExp(city.trim(), "i");
        }

        // Add product type filter
        if (product && product.trim()) {
          query.product = new RegExp(product.trim(), "i");
        }

        // Add price range filter
        if (minPrice > 0 || maxPrice < Number.MAX_SAFE_INTEGER) {
          query["price.value"] = {
            $gte: Number(minPrice),
            $lte: Number(maxPrice),
          };
        }

        // Build sort options
        const sortOptions = {};
        const sortField =
          sortBy === "price"
            ? "price.value"
            : sortBy === "quantity"
            ? "quantity.value"
            : sortBy === "harvestDate"
            ? "harvestDate"
            : "createdAt";
        sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;

        const data = await SellerInfo.find(query, { sort: sortOptions });

        res.status(200).send({
          status: true,
          message: data,
          totalCount: data.length,
          filters: {
            search,
            state,
            city,
            product,
            minPrice,
            maxPrice,
            sortBy,
            sortOrder,
          },
        });
      } catch (error) {
        console.error("Error in getItemsList:", error);
        res.status(200).send({ status: false, message: error.message });
      }
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });

  router.post("/allItems", async (req, res) => {
    let token = req.body.token;
    let auth = utils.authenticateToken(token);
    if (auth != false) {
      let email = auth.email.split(",")[1];
      try {
        // Use the correct field names from the new schema
        const data = await SellerInfo.find(
          { email: email }, // Use lowercase 'email' field
          {
            projection: { name: 0, email: 0 }, // Use lowercase field names
            sort: { _id: -1 },
          }
        );
        res.status(200).send({ status: true, message: data });
      } catch (error) {
        console.error("Error in allItems:", error);
        res.status(200).send({ status: false, message: "No Items found" });
      }
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });

  router.post("/editItems", async (req, res) => {
    let token = req.body.token;
    let auth = utils.authenticateToken(token);
    if (auth != false) {
      let email = auth.email.split(",")[1];
      let id = req.body.id,
        price = req.body.price,
        quantity = req.body.quantity,
        contact = req.body.contact,
        address = req.body.address;

      try {
        // Prepare update object
        let updateData = {
          "price.value": parseFloat(price) || 0, // Update nested price.value
          "quantity.value": parseFloat(quantity) || 0, // Update nested quantity.value
          contact: contact, // Use lowercase 'contact' field
        };

        // Handle address - support both old string format and new object format
        if (typeof address === "object" && address !== null) {
          // New format: address is an object with street, city, state, pinCode
          if (address.street) updateData["address.street"] = address.street;
          if (address.city) updateData["address.city"] = address.city;
          if (address.state) updateData["address.state"] = address.state;
          if (address.pinCode) updateData["address.pinCode"] = address.pinCode;
        } else if (typeof address === "string") {
          // Old format: address is a string (backward compatibility)
          updateData["address.street"] = address;
        }

        // Convert ID to ObjectId if it's a string
        const objectId = ObjectId.isValid(id) ? new ObjectId(id) : id;

        // First, let's check if the document exists
        const existingItem = await SellerInfo.findOne({
          email: email,
          _id: objectId,
        });

        if (!existingItem) {
          res.status(200).send({
            status: false,
            message: "Item not found with provided email and ID",
          });
          return;
        }

        const updatedItem = await SellerInfo.updateOne(
          { email: email, _id: objectId }, // Filter criteria with proper ObjectId
          updateData // Update data (repository handles $set automatically)
        );

        if (!updatedItem) {
          res
            .status(200)
            .send({ status: false, message: "No data found or update failed" });
        } else {
          res.status(200).send({ status: true, message: "Data is updated" });
        }
      } catch (err) {
        console.error("Error updating item:", err);
        console.error("Error stack:", err.stack);
        res
          .status(200)
          .send({ status: false, message: "Failed to update data" });
      }
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });

  router.post("/deleteItems", async (req, res) => {
    let token = req.body.token;
    let auth = utils.authenticateToken(token);
    if (auth != false) {
      let email = auth.email.split(",")[1];
      let id = req.body.id;

      try {
        // Use the correct field names from the new schema
        const deletedItem = await SellerInfo.deleteOne({
          email: email, // Use lowercase 'email' field
          _id: id,
        });

        if (deletedItem.deletedCount === 0) {
          res
            .status(200)
            .send({ status: false, message: "No item found to delete" });
        } else {
          res
            .status(200)
            .send({ status: true, message: "Data deleted successfully" });
        }
      } catch (err) {
        console.error("Error deleting item:", err);
        res
          .status(200)
          .send({ status: false, message: "Failed to delete data" });
      }
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });

  router.post("/addRequest", async (req, res) => {
    let token = req.body.token;
    let auth = utils.authenticateToken(token);
    if (auth != false) {
      let sellerId = req.body.sellerId;
      let buyerId = req.body.buyerId;
      let sellerName = req.body.sellerName;
      let buyerName = req.body.buyerName;
      let buyerEmail = req.body.buyerEmail;
      let buyerContact = req.body.buyerContact;

      try {
        await RequestInfo.create({
          sellerId: sellerId,
          buyerId: buyerId,
          sellerName: sellerName,
          buyerName: buyerName,
          buyerEmail: buyerEmail,
          buyerContact: buyerContact,
          status: "pending",
        });
        res.status(200).send({ status: true, message: "Request Sent" });
      } catch (err) {
        console.error("Error creating request:", err);
        res
          .status(200)
          .send({ status: false, message: "Can not send Request" });
      }
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });

  router.post("/getRequestData", async (req, res) => {
    let token = req.body.token;
    let auth = utils.authenticateToken(token);
    if (auth != false) {
      let sellerId = req.body.sellerId;
      let buyerId = req.body.buyerId;
      try {
        const docs = await RequestInfo.find({
          sellerId: sellerId,
          buyerId: buyerId,
        });
        if (!docs || docs.length === 0) {
          res.status(200).send({ status: false, message: "No Data" });
        } else {
          res
            .status(200)
            .send({ status: true, message: docs[0].status || "pending" });
        }
      } catch (err) {
        console.error("Error fetching request data:", err);
        res.status(200).send({ status: false, message: "No Data" });
      }
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });

  router.post("/allRequests", async (req, res) => {
    let token = req.body.token;
    let auth = utils.authenticateToken(token);
    if (auth != false) {
      let id = auth.email.split(",")[3];
      try {
        const data = await RequestInfo.find(
          { sellerId: id },
          { sort: { _id: -1 } }
        );
        res.status(200).send({ status: true, message: data });
      } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(200).send({ status: false, message: "No Requests found" });
      }
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });

  router.post("/ApproveOrDeny", async (req, res) => {
    let token = req.body.token;
    let auth = utils.authenticateToken(token);
    if (auth != false) {
      let email = auth.email.split(",")[1];
      let id = req.body.id,
        status = req.body.decision;
      let value;

      if (status == "Approve") value = "accepted";
      else if (status == "Deny") value = "rejected";
      else value = "pending";

      try {
        const updatedRequest = await RequestInfo.updateOne(
          { _id: id },
          { status: value }
        );
        if (!updatedRequest) {
          res.status(200).send({ status: false, message: "No data found" });
        } else {
          res.status(200).send({ status: true, message: "data is updated" });
        }
      } catch (err) {
        console.error("Error updating request status:", err);
        res.status(200).send({ status: false, message: "No data found" });
      }
    } else res.status(200).send({ status: false, message: "Invalid Token" });
  });
}
