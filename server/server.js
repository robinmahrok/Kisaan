import express from "express";
import config from "./config/config.js";
import dbConnection from "./config/database.js";
import { initializeAllIndexes } from "./repositories/index.js";
import allRoutes from "./routes/allRoutes.js";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import session from "express-session";
import cors from "cors";

const app = express();

// Configure CORS
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3005",
      "https://kisaanapp.netlify.app/",
    ],
    credentials: true,
  })
);

// Middleware
app.use(fileUpload());
app.use(express.static("./public"));
app.use("/static", express.static("./public"));

app.use(
  session({
    secret: config.APP.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.APP.NODE_ENV === "production", // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb", extended: true }));

// MongoDB connection with native driver
async function initializeDatabase() {
  try {
    await dbConnection.connect();
    await initializeAllIndexes();
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await dbConnection.disconnect();
    console.log("🔒 MongoDB connection closed through app termination");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during graceful shutdown:", error);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  try {
    await dbConnection.disconnect();
    console.log("🔒 MongoDB connection closed through app termination");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during graceful shutdown:", error);
    process.exit(1);
  }
});

// Initialize routes after database connection
app.use("/", allRoutes);

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    status: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { error: error.message }),
  });
});

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({
    status: false,
    message: "Route not found",
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Start server
    const PORT = process.env.PORT || 3005;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 CORS Origins: ${config.APP.CORS_ORIGINS.join(", ")}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the application
startServer();
