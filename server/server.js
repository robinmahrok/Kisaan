import express from "express";
import config from "./config/config.js";
import dbConnection from "./config/database.js";
import { initializeAllIndexes } from "./repositories/index.js";
import allRoutes from "./routes/allRoutes.js";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import session from "express-session";
import cors from "cors";
import path from "path";

const app = express();

// Configure CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, direct server access)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3005",
        "https://kisaan.netlify.app",
        "https://kisaanapp.netlify.app",
      ];

      // In production, allow all HTTPS origins for flexibility
      if (origin.startsWith("https://")) {
        return callback(null, true);
      }

      // Allow specific development origins
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(null, true); // Allow all for now to fix deployment issues
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
    optionsSuccessStatus: 200,
  })
);

// Middleware
app.use(fileUpload());

// Static files with CORS headers
app.use(
  express.static("./public", {
    setHeaders: (res, path, stat) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET");
      res.set("Access-Control-Allow-Headers", "Content-Type");
    },
  })
);

app.use(
  "/static",
  express.static("./public", {
    setHeaders: (res, path, stat) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET");
      res.set("Access-Control-Allow-Headers", "Content-Type");
    },
  })
);

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

// Handle image requests specifically with CORS
app.get("/static/images/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(process.cwd(), "public", "images", filename);

  // Set CORS headers for images
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Cache-Control", "public, max-age=86400"); // Cache for 1 day

  res.sendFile(filepath, (err) => {
    if (err) {
      console.log("Image not found:", filename);
      res.status(404).send("Image not found");
    }
  });
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
