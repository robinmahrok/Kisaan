import { MongoClient, ServerApiVersion } from "mongodb";
import bcrypt from "bcrypt";
import config from "../config/config.js";

class FarmersDatabaseInitializer {
  constructor() {
    this.client = null;
    this.db = null;
    this.dbName = "farmers";
  }

  async connect() {
    try {
      this.client = new MongoClient(config.dbURL, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      await this.client.db("admin").command({ ping: 1 });
      this.db = this.client.db(this.dbName);

      console.log("✅ Connected to MongoDB successfully");
      console.log("📊 Database:", this.db.databaseName);
      return true;
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      return false;
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        console.log("🔒 Disconnected from MongoDB");
      }
    } catch (error) {
      console.error("❌ Error disconnecting:", error);
    }
  }

  async createCollections() {
    try {
      console.log("📊 Creating collections and indexes...");

      // Define collections with their indexes
      const collections = [
        {
          name: "signups",
          indexes: [
            { key: { email: 1 }, options: { unique: true } },
            { key: { contact: 1 }, options: { unique: true } },
          ],
        },
        {
          name: "sellers",
          indexes: [
            { key: { userId: 1 }, options: { unique: true } },
            { key: { email: 1 }, options: { unique: true } },
          ],
        },
        {
          name: "banks",
          indexes: [
            { key: { userId: 1 } },
            { key: { accountNumber: 1 }, options: { unique: true } },
          ],
        },
        {
          name: "requests",
          indexes: [
            { key: { sellerId: 1 } },
            { key: { buyerId: 1 } },
            { key: { createdAt: -1 } },
          ],
        },
        {
          name: "transactions",
          indexes: [
            { key: { sellerId: 1 } },
            { key: { buyerId: 1 } },
            { key: { requestId: 1 } },
            { key: { createdAt: -1 } },
          ],
        },
        {
          name: "seeds",
          indexes: [
            { key: { "products.name": 1 } },
            { key: { "products.category": 1 } },
            { key: { "products.isActive": 1 } },
            { key: { lastUpdated: -1 } },
          ],
        },
      ];

      // Create collections and indexes
      for (const collection of collections) {
        try {
          await this.db.createCollection(collection.name);
          console.log(`✅ Created collection: ${collection.name}`);
        } catch (error) {
          if (error.code === 48) {
            console.log(`📋 Collection ${collection.name} already exists`);
          } else {
            throw error;
          }
        }

        // Create indexes
        for (const index of collection.indexes) {
          try {
            await this.db
              .collection(collection.name)
              .createIndex(index.key, index.options || {});
            console.log(
              `📇 Created index on ${collection.name}:`,
              Object.keys(index.key).join(", ")
            );
          } catch (error) {
            if (error.code !== 85) {
              // Index already exists
              console.error(
                `❌ Error creating index on ${collection.name}:`,
                error.message
              );
            }
          }
        }
      }

      console.log("✅ Collections and indexes created successfully");
      return true;
    } catch (error) {
      console.error("❌ Error creating collections:", error);
      return false;
    }
  }

  async createSeedData() {
    try {
      console.log("🌾 Creating seed data for products...");

      // Check if seed data already exists
      const existingSeedData = await this.db
        .collection("seeds")
        .countDocuments();
      if (existingSeedData > 0) {
        console.log("📋 Seed data already exists, skipping creation");
        return true;
      }

      const seedData = {
        products: [
          {
            name: "Potato",
            category: "vegetables",
            scientificName: "Solanum tuberosum",
            varieties: [
              {
                name: "Pukhraj",
                description: "High yielding variety with good storage quality",
              },
              {
                name: "Chipsona",
                description: "Ideal for chip making with low sugar content",
              },
              {
                name: "Chandramukhi",
                description: "Early maturing variety with good taste",
              },
            ],
            marketInfo: {
              averagePrice: { value: 25, unit: "kg", lastUpdated: new Date() },
              majorProducingStates: [
                "Punjab",
                "Uttar Pradesh",
                "Bihar",
                "Haryana",
              ],
              harvestMonths: [
                "January",
                "February",
                "March",
                "October",
                "November",
                "December",
              ],
            },
            isActive: true,
          },
          {
            name: "Paddy",
            category: "cereals",
            scientificName: "Oryza sativa",
            varieties: [
              {
                name: "Pusa-834",
                description: "High yielding basmati variety",
              },
              { name: "Ratnagiri-3", description: "Disease resistant variety" },
            ],
            marketInfo: {
              averagePrice: {
                value: 20,
                unit: "kg",
                lastUpdated: new Date(),
              },
              majorProducingStates: [
                "Punjab",
                "Haryana",
                "Uttar Pradesh",
                "Andhra Pradesh",
              ],
              harvestMonths: ["October", "November", "December"],
            },
            isActive: true,
          },
          {
            name: "Wheat",
            category: "cereals",
            scientificName: "Triticum aestivum",
            varieties: [
              { name: "VL-832", description: "High protein content variety" },
              {
                name: "PBW-343",
                description: "Popular variety in North India",
              },
              { name: "VL-804", description: "Drought resistant variety" },
              { name: "HS-365", description: "Heat tolerant variety" },
              { name: "HS-240", description: "Early maturing variety" },
            ],
            marketInfo: {
              averagePrice: {
                value: 22,
                unit: "kg",
                lastUpdated: new Date(),
              },
              majorProducingStates: [
                "Punjab",
                "Haryana",
                "Uttar Pradesh",
                "Madhya Pradesh",
              ],
              harvestMonths: ["April", "May"],
            },
            isActive: true,
          },
        ],
        marketTrends: [],
        seasonalCalendar: [
          {
            month: "January",
            activities: [
              {
                product: "Potato",
                activity: "harvesting",
                description: "Main harvest season for potato",
              },
              {
                product: "Wheat",
                activity: "irrigation",
                description: "Critical irrigation period",
              },
            ],
          },
          {
            month: "April",
            activities: [
              {
                product: "Wheat",
                activity: "harvesting",
                description: "Main harvest season for wheat",
              },
            ],
          },
          {
            month: "October",
            activities: [
              {
                product: "Paddy",
                activity: "harvesting",
                description: "Kharif harvest season",
              },
              {
                product: "Potato",
                activity: "sowing",
                description: "Sowing season for potato",
              },
            ],
          },
        ],
        lastUpdated: new Date(),
      };

      await this.db.collection("seeds").insertOne(seedData);
      console.log("🌾 Seed data created successfully");
      console.log("📦 Products seeded: Potato, Paddy, Wheat");
      console.log("🔢 Total varieties: 10");

      return true;
    } catch (error) {
      console.error("❌ Error creating seed data:", error);
      return false;
    }
  }

  async createSampleData() {
    try {
      console.log("🌱 Creating sample data...");

      // Check if data already exists
      const existingUsers = await this.db
        .collection("signups")
        .countDocuments();
      if (existingUsers > 0) {
        console.log("📋 Sample data already exists, skipping creation");
        return true;
      }

      // Create sample users
      const sampleUsers = [
        {
          name: "Raj Kumar",
          email: "raj.farmer@example.com",
          contact: "9876543210",
          password: await bcrypt.hash("password123", 10),
          otp: 0,
          otpVerify: "verified",
          isActive: true,
          role: "seller",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Admin User",
          email: "admin@kisaan.com",
          contact: "9876543212",
          password: await bcrypt.hash("admin123", 10),
          otp: 0,
          otpVerify: "verified",
          isActive: true,
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const userResult = await this.db
        .collection("signups")
        .insertMany(sampleUsers);
      console.log("👥 Sample users created:", userResult.insertedCount);

      // Get the seller user for related data
      const seller = await this.db
        .collection("signups")
        .findOne({ role: "seller" });

      if (seller) {
        // Create sample seller profile
        const sampleSeller = {
          userId: seller._id,
          name: seller.name,
          email: seller.email,
          contact: seller.contact,
          state: "Punjab",
          district: "Ludhiana",
          village: "Khanna",
          pincode: "141401",
          crops: ["Wheat", "Rice", "Corn"],
          farmSize: "5 acres",
          experience: "10 years",
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await this.db.collection("sellers").insertOne(sampleSeller);
        console.log("🚜 Sample seller profile created");

        // Create sample bank data
        const sampleBank = {
          userId: seller._id,
          accountHolderName: "Raj Kumar",
          accountNumber: "1234567890123456",
          ifscCode: "SBIN0001234",
          bankName: "State Bank of India",
          branchName: "Khanna Branch",
          accountType: "Savings",
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await this.db.collection("banks").insertOne(sampleBank);
        console.log("🏦 Sample bank data created");
      }

      // Create seed data for products
      await this.createSeedData();

      console.log("✅ Sample data created successfully");
      return true;
    } catch (error) {
      console.error("❌ Error creating sample data:", error);
      return false;
    }
  }

  async initializeDatabase() {
    try {
      console.log("🚀 Initializing farmers database...");
      console.log("📍 Database Name:", this.dbName);

      // Connect to database
      const connected = await this.connect();
      if (!connected) {
        throw new Error("Failed to connect to database");
      }

      // Create collections and indexes
      const collectionsCreated = await this.createCollections();
      if (!collectionsCreated) {
        throw new Error("Failed to create collections");
      }

      // Create sample data
      const sampleDataCreated = await this.createSampleData();
      if (!sampleDataCreated) {
        throw new Error("Failed to create sample data");
      }

      console.log("🎉 Farmers database initialized successfully!");
      console.log("📊 Database Name: farmers");
      console.log(
        "📋 Collections: signups, sellers, banks, requests, transactions, seeds"
      );
      console.log("👥 Sample users created with verified OTP status");
      console.log("🌾 Product seed data created (Potato, Paddy, Wheat)");
      console.log("🔑 Login credentials:");
      console.log("   Seller: raj.farmer@example.com / password123");
      console.log("   Admin: admin@kisaan.com / admin123");

      return true;
    } catch (error) {
      console.error("❌ Database initialization failed:", error);
      return false;
    } finally {
      await this.disconnect();
    }
  }

  async clearDatabase() {
    try {
      console.log("🧹 Clearing farmers database...");

      const connected = await this.connect();
      if (!connected) {
        throw new Error("Failed to connect to database");
      }

      // Drop all collections
      const collections = await this.db.listCollections().toArray();
      for (const collection of collections) {
        await this.db.dropCollection(collection.name);
        console.log(`🗑️ Dropped collection: ${collection.name}`);
      }

      console.log("✅ Database cleared successfully");
      return true;
    } catch (error) {
      console.error("❌ Error clearing database:", error);
      return false;
    } finally {
      await this.disconnect();
    }
  }

  async showStatus() {
    try {
      console.log("📊 Farmers Database Status");
      console.log("========================");

      const connected = await this.connect();
      if (!connected) {
        console.log("❌ Cannot connect to database");
        return false;
      }

      console.log("📍 Database Name:", this.db.databaseName);

      const collections = await this.db.listCollections().toArray();
      console.log("📋 Collections:", collections.length);

      for (const collection of collections) {
        const count = await this.db
          .collection(collection.name)
          .countDocuments();
        console.log(`   ${collection.name}: ${count} documents`);
      }

      return true;
    } catch (error) {
      console.error("❌ Error getting database status:", error);
      return false;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const initializer = new FarmersDatabaseInitializer();

  switch (command) {
    case "init":
      await initializer.initializeDatabase();
      break;
    case "clear":
      await initializer.clearDatabase();
      break;
    case "reset":
      await initializer.clearDatabase();
      await initializer.initializeDatabase();
      break;
    case "status":
      await initializer.showStatus();
      break;
    default:
      console.log("🌾 Farmers Database Management");
      console.log("Usage: node init-farmers-db.js [command]");
      console.log("Commands:");
      console.log(
        "  init   - Initialize database with collections and sample data"
      );
      console.log("  clear  - Clear all data from database");
      console.log("  reset  - Clear and reinitialize database");
      console.log("  status - Show database status and collection counts");
      console.log("");
      console.log("Example: node init-farmers-db.js init");
      break;
  }

  process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default FarmersDatabaseInitializer;
