import { ObjectId } from "mongodb";
import dbConnection from "../config/database.js";

class BaseRepository {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  getCollection() {
    return dbConnection.getCollection(this.collectionName);
  }

  // Convert string ID to ObjectId if needed
  toObjectId(id) {
    if (typeof id === "string" && ObjectId.isValid(id)) {
      return new ObjectId(id);
    }
    return id;
  }

  // Convert ObjectId to string for API responses
  toPlainObject(doc) {
    if (!doc) return null;
    if (Array.isArray(doc)) {
      return doc.map((item) => this.toPlainObject(item));
    }

    const plainDoc = { ...doc };
    if (plainDoc._id) {
      plainDoc.id = plainDoc._id.toString();
    }
    return plainDoc;
  }

  // Create a new document
  async create(data) {
    try {
      const collection = this.getCollection();
      const now = new Date();

      const docToInsert = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const result = await collection.insertOne(docToInsert);
      const insertedDoc = await collection.findOne({ _id: result.insertedId });
      return this.toPlainObject(insertedDoc);
    } catch (error) {
      console.error(
        `Error creating document in ${this.collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Find document by ID
  async findById(id) {
    try {
      const collection = this.getCollection();
      const doc = await collection.findOne({ _id: this.toObjectId(id) });
      return this.toPlainObject(doc);
    } catch (error) {
      console.error(
        `Error finding document by ID in ${this.collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Find one document by filter
  async findOne(filter = {}) {
    try {
      const collection = this.getCollection();
      const doc = await collection.findOne(filter);
      return this.toPlainObject(doc);
    } catch (error) {
      console.error(`Error finding document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Find multiple documents
  async find(filter = {}, options = {}) {
    try {
      const collection = this.getCollection();
      const { limit, skip, sort, projection } = options;

      let cursor = collection.find(filter);

      if (projection) cursor = cursor.project(projection);
      if (sort) cursor = cursor.sort(sort);
      if (skip) cursor = cursor.skip(skip);
      if (limit) cursor = cursor.limit(limit);

      const docs = await cursor.toArray();
      return this.toPlainObject(docs);
    } catch (error) {
      console.error(
        `Error finding documents in ${this.collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Legacy field name mapper for backward compatibility
  mapLegacyFields(filter) {
    const fieldMap = {
      // Old field names -> new field names
      Email: "email",
      Name: "name",
      Contact: "contact",
      Password: "password",
      OtpVerify: "otpVerify",
      Otp: "otp",
      Id: "_id",
    };

    const mappedFilter = {};
    for (const [key, value] of Object.entries(filter)) {
      const mappedKey = fieldMap[key] || key;
      mappedFilter[mappedKey] = value;
    }
    return mappedFilter;
  }

  // Update document by ID
  async updateById(id, updateData) {
    try {
      const collection = this.getCollection();
      const filter = { _id: this.toObjectId(id) };
      const update = {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      };

      const updateResult = await collection.updateOne(filter, update);

      if (updateResult.matchedCount === 0) {
        return null;
      }

      // Fetch the updated document
      const updatedDoc = await collection.findOne(filter);
      return updatedDoc ? this.toPlainObject(updatedDoc) : null;
    } catch (error) {
      console.error(
        `Error updating document by ID in ${this.collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Update one document by filter
  async updateOne(filter, updateData) {
    try {
      const collection = this.getCollection();

      // Debug logging
      console.log(
        `[${this.collectionName}] UpdateOne - Filter:`,
        JSON.stringify(filter)
      );
      console.log(
        `[${this.collectionName}] UpdateOne - UpdateData:`,
        JSON.stringify(updateData)
      );

      const update = {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      };

      // Use updateOne instead of findOneAndUpdate, then fetch the document
      const updateResult = await collection.updateOne(filter, update);

      console.log(
        `[${this.collectionName}] UpdateOne - MatchedCount:`,
        updateResult.matchedCount
      );
      console.log(
        `[${this.collectionName}] UpdateOne - ModifiedCount:`,
        updateResult.modifiedCount
      );

      if (updateResult.matchedCount === 0) {
        console.log(
          `[${this.collectionName}] UpdateOne - No document matched the filter`
        );
        return null;
      }

      // Fetch the updated document
      const updatedDoc = await collection.findOne(filter);
      console.log(
        `[${this.collectionName}] UpdateOne - Updated doc:`,
        updatedDoc ? "Found" : "Not Found"
      );

      return updatedDoc ? this.toPlainObject(updatedDoc) : null;
    } catch (error) {
      console.error(
        `Error updating document in ${this.collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Update multiple documents
  async updateMany(filter, updateData) {
    try {
      const collection = this.getCollection();
      const update = {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      };

      const result = await collection.updateMany(filter, update);
      return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      console.error(
        `Error updating multiple documents in ${this.collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Delete document by ID
  async deleteById(id) {
    try {
      const collection = this.getCollection();
      const result = await collection.deleteOne({ _id: this.toObjectId(id) });
      return { deletedCount: result.deletedCount };
    } catch (error) {
      console.error(
        `Error deleting document by ID in ${this.collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Delete one document by filter
  async deleteOne(filter) {
    try {
      const collection = this.getCollection();
      const result = await collection.deleteOne(filter);
      return { deletedCount: result.deletedCount };
    } catch (error) {
      console.error(
        `Error deleting document in ${this.collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Delete multiple documents
  async deleteMany(filter) {
    try {
      const collection = this.getCollection();
      const result = await collection.deleteMany(filter);
      return { deletedCount: result.deletedCount };
    } catch (error) {
      console.error(
        `Error deleting multiple documents in ${this.collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Count documents
  async count(filter = {}) {
    try {
      const collection = this.getCollection();
      return await collection.countDocuments(filter);
    } catch (error) {
      console.error(
        `Error counting documents in ${this.collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Check if document exists
  async exists(filter) {
    try {
      const count = await this.count(filter);
      return count > 0;
    } catch (error) {
      console.error(
        `Error checking document existence in ${this.collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Aggregate pipeline
  async aggregate(pipeline) {
    try {
      const collection = this.getCollection();
      const result = await collection.aggregate(pipeline).toArray();
      return this.toPlainObject(result);
    } catch (error) {
      console.error(
        `Error running aggregation in ${this.collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Create index
  async createIndex(indexSpec, options = {}) {
    try {
      const collection = this.getCollection();
      return await collection.createIndex(indexSpec, options);
    } catch (error) {
      console.error(`Error creating index in ${this.collectionName}:`, error);
      throw error;
    }
  }
}

export default BaseRepository;
