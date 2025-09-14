import { MongoClient, ServerApiVersion } from 'mongodb';
import config from './config.js';

class DatabaseConnection {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Create MongoDB client with modern configuration
      this.client = new MongoClient(config.dbURL, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        maxPoolSize: 10, // Maximum number of connections in the connection pool
        serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 30 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        retryWrites: true,
        w: 'majority',
        // Connection pool settings
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        waitQueueTimeoutMS: 5000
      });

      // Connect to MongoDB
      await this.client.connect();
      
      // Test the connection
      await this.client.db("admin").command({ ping: 1 });
      
      // Get database instance
      this.db = this.client.db('farmers'); // Your database name
      this.isConnected = true;
      
      console.log('✅ Connected to MongoDB successfully with native driver');
      console.log('📊 Database:', this.db.databaseName);
      
      // Setup connection event listeners
      this.setupEventListeners();
      
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      this.isConnected = false;
      throw error;
    }
  }

  setupEventListeners() {
    // Handle connection events
    this.client.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('⚠️ MongoDB connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnect', () => {
      console.log('✅ MongoDB reconnected');
      this.isConnected = true;
    });
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        this.isConnected = false;
        console.log('🔒 MongoDB connection closed');
      }
    } catch (error) {
      console.error('❌ Error during MongoDB disconnect:', error);
      throw error;
    }
  }

  getDb() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  getClient() {
    if (!this.isConnected || !this.client) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.client;
  }

  isConnectionActive() {
    return this.isConnected;
  }

  // Helper method to get collection
  getCollection(collectionName) {
    return this.getDb().collection(collectionName);
  }

  // Helper method for transactions
  async withTransaction(callback) {
    const session = this.client.startSession();
    try {
      return await session.withTransaction(callback);
    } finally {
      await session.endSession();
    }
  }
}

// Create singleton instance
const dbConnection = new DatabaseConnection();

export default dbConnection;
export { DatabaseConnection }; 