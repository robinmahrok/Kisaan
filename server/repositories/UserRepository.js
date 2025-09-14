import BaseRepository from './BaseRepository.js';
import bcrypt from 'bcrypt';

class UserRepository extends BaseRepository {
  constructor() {
    super('signups'); // Collection name matching your Mongoose model
  }

  // Validation helper methods
  validateUserData(userData) {
    const errors = [];

    // Name validation
    if (!userData.name || userData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    if (userData.name && userData.name.length > 50) {
      errors.push('Name cannot exceed 50 characters');
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!userData.email || !emailRegex.test(userData.email)) {
      errors.push('Please enter a valid email');
    }

    // Contact validation
    const contactRegex = /^[0-9]{10}$/;
    if (!userData.contact || !contactRegex.test(userData.contact)) {
      errors.push('Please enter a valid 10-digit contact number');
    }

    // Password validation
    if (!userData.password || userData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return errors;
  }

  // Create user with validation and password hashing
  async createUser(userData) {
    try {
      // Validate user data
      const validationErrors = this.validateUserData(userData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Check if user already exists
      const existingUser = await this.findOne({
        $or: [
          { email: userData.email.toLowerCase() },
          { contact: userData.contact }
        ]
      });

      if (existingUser) {
        throw new Error('User with this email or contact already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Prepare user data
      const userToCreate = {
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        contact: userData.contact.trim(),
        password: hashedPassword,
        otp: userData.otp || 0,
        otpVerify: userData.otpVerify || 'pending',
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        role: userData.role || 'buyer'
      };

      // Create user
      const newUser = await this.create(userToCreate);
      
      // Remove password from response
      const { password, ...userResponse } = newUser;
      return userResponse;

    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Find user by email
  async getUserByEmail(email) {
    try {
      return await this.findOne({ email: email.toLowerCase() });
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  // Find user by contact
  async getUserByContact(contact) {
    try {
      return await this.findOne({ contact });
    } catch (error) {
      console.error('Error finding user by contact:', error);
      throw error;
    }
  }

  // Update OTP
  async updateOTP(email, otp) {
    try {
      return await this.updateOne(
        { email: email.toLowerCase() },
        { otp, otpVerify: 'pending' }
      );
    } catch (error) {
      console.error('Error updating OTP:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.otp !== parseInt(otp)) {
        throw new Error('Invalid OTP');
      }

      // Update user as verified
      const updatedUser = await this.updateOne(
        { email: email.toLowerCase() },
        { 
          otpVerify: 'verified',
          otp: 0,
          isActive: true
        }
      );

      // Remove password from response
      const { password, ...userResponse } = updatedUser;
      return userResponse;

    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  // Generate and save OTP
  async generateOTP(email) {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
      
      const updatedUser = await this.updateOne(
        { email: email.toLowerCase() },
        { otp, otpVerify: 'pending' }
      );

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return { otp, user: updatedUser };
    } catch (error) {
      console.error('Error generating OTP:', error);
      throw error;
    }
  }

  // Authenticate user (login)
  async authenticateUser(email, password) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('Account is inactive');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      // Remove password from response
      const { password: userPassword, ...userResponse } = user;
      return userResponse;

    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  // Update password
  async updatePassword(email, newPassword) {
    try {
      // Validate password
      if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const updatedUser = await this.updateOne(
        { email: email.toLowerCase() },
        { password: hashedPassword }
      );

      if (!updatedUser) {
        throw new Error('User not found');
      }

      // Remove password from response
      const { password, ...userResponse } = updatedUser;
      return userResponse;

    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role) {
    try {
      const users = await this.find({ role, isActive: true });
      // Remove passwords from response
      return users.map(user => {
        const { password, ...userResponse } = user;
        return userResponse;
      });
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  }

  // Deactivate user
  async deactivateUser(userId) {
    try {
      return await this.updateById(userId, { isActive: false });
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  // Activate user
  async activateUser(userId) {
    try {
      return await this.updateById(userId, { isActive: true });
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }

  // Get user profile (without password)
  async getUserProfile(userId) {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove password from response
      const { password, ...userResponse } = user;
      return userResponse;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Override find method to handle legacy field names
  async find(filter = {}, options = {}) {
    const mappedFilter = this.mapLegacyFields(filter);
    return await super.find(mappedFilter, options);
  }

  // Override updateOne method to handle legacy field names
  async updateOne(filter, updateData) {
    const mappedFilter = this.mapLegacyFields(filter);
    const mappedUpdateData = this.mapLegacyFields(updateData);
    return await super.updateOne(mappedFilter, mappedUpdateData);
  }

  // Initialize indexes
  async initializeIndexes() {
    try {
      const collection = this.getCollection();
      
      // Get existing indexes
      const existingIndexes = await collection.listIndexes().toArray();
      const indexNames = existingIndexes.map(idx => idx.name);
      
      console.log('📋 Existing indexes:', indexNames);
      
      // Clean up data before creating unique indexes
      await this.cleanupDataForIndexes(collection);
      
      // Helper function to create index if it doesn't exist or recreate if different
      const ensureIndex = async (indexSpec, options = {}) => {
        const indexName = options.name || Object.keys(indexSpec).map(key => `${key}_${indexSpec[key]}`).join('_');
        const existingIndex = existingIndexes.find(idx => idx.name === indexName);
        
        if (existingIndex) {
          // Check if the existing index matches our requirements
          const existingUnique = existingIndex.unique || false;
          const requiredUnique = options.unique || false;
          
          if (existingUnique !== requiredUnique) {
            console.log(`🔄 Recreating index ${indexName} to change unique constraint`);
            // Drop the existing index and recreate with correct options
            await collection.dropIndex(indexName);
            await collection.createIndex(indexSpec, options);
            console.log(`✅ Recreated index: ${indexName}`);
          } else {
            console.log(`✅ Index already exists: ${indexName}`);
          }
        } else {
          await collection.createIndex(indexSpec, options);
          console.log(`✅ Created new index: ${indexName}`);
        }
      };
      
      // Create unique index on email (with partial filter to exclude null values)
      await ensureIndex(
        { email: 1 }, 
        { 
          unique: true, 
          name: 'email_unique',
          partialFilterExpression: { 
            email: { 
              $exists: true, 
              $type: "string"
            } 
          }
        }
      );
      
      // Create unique index on contact (with partial filter to exclude null values)
      await ensureIndex(
        { contact: 1 }, 
        { 
          unique: true, 
          name: 'contact_unique',
          partialFilterExpression: { 
            contact: { 
              $exists: true, 
              $type: "string"
            } 
          }
        }
      );
      
      // Create index on role for faster queries
      await ensureIndex({ role: 1 }, { name: 'role_1' });
      
      // Create compound index on isActive and role
      await ensureIndex({ isActive: 1, role: 1 }, { name: 'isActive_role_1' });
      
      // Create index on otpVerify for faster queries
      await ensureIndex({ otpVerify: 1 }, { name: 'otpVerify_1' });
      
      console.log('✅ All user indexes initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing user indexes:', error);
      // Don't throw error to prevent app from crashing on index issues
      console.log('⚠️ Continuing without index optimization...');
    }
  }

  // Clean up data before creating unique indexes
  async cleanupDataForIndexes(collection) {
    try {
      console.log('🧹 Cleaning up data for unique indexes...');
      
      // Check for documents with null or empty emails
      const nullEmailCount = await collection.countDocuments({
        $or: [
          { email: null },
          { email: "" },
          { email: { $exists: false } }
        ]
      });
      
      if (nullEmailCount > 0) {
        console.log(`⚠️ Found ${nullEmailCount} documents with null/empty email`);
        
        // Option 1: Delete documents with null emails (uncomment if you want this)
        // const deleteResult = await collection.deleteMany({
        //   $or: [
        //     { email: null },
        //     { email: "" },
        //     { email: { $exists: false } }
        //   ]
        // });
        // console.log(`🗑️ Deleted ${deleteResult.deletedCount} documents with null emails`);
        
                 // Option 2: Update documents with null emails to have a placeholder (recommended)
         const updateResult = await collection.updateMany(
           {
             $or: [
               { email: null },
               { email: "" },
               { email: { $exists: false } },
               { email: { $type: { $ne: "string" } } }
             ]
           },
           {
             $set: {
               email: `placeholder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@temp.local`,
               isActive: false,
               otpVerify: "pending"
             }
           }
         );
        console.log(`🔧 Updated ${updateResult.modifiedCount} documents with placeholder emails`);
      }
      
      // Check for documents with null or empty contacts
      const nullContactCount = await collection.countDocuments({
        $or: [
          { contact: null },
          { contact: "" },
          { contact: { $exists: false } }
        ]
      });
      
      if (nullContactCount > 0) {
        console.log(`⚠️ Found ${nullContactCount} documents with null/empty contact`);
        
                 // Update documents with null contacts to have a placeholder
         const updateResult = await collection.updateMany(
           {
             $or: [
               { contact: null },
               { contact: "" },
               { contact: { $exists: false } },
               { contact: { $type: { $ne: "string" } } }
             ]
           },
           {
             $set: {
               contact: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
               isActive: false
             }
           }
         );
        console.log(`🔧 Updated ${updateResult.modifiedCount} documents with placeholder contacts`);
      }
      
      // Check for duplicate emails
      const duplicateEmails = await collection.aggregate([
        { $match: { email: { $exists: true, $ne: null, $ne: "" } } },
        { $group: { _id: "$email", count: { $sum: 1 }, docs: { $push: "$$ROOT" } } },
        { $match: { count: { $gt: 1 } } }
      ]).toArray();
      
      if (duplicateEmails.length > 0) {
        console.log(`⚠️ Found ${duplicateEmails.length} duplicate email groups`);
        
        for (const group of duplicateEmails) {
          // Keep the first document, mark others as inactive with modified emails
          const docs = group.docs;
          for (let i = 1; i < docs.length; i++) {
            await collection.updateOne(
              { _id: docs[i]._id },
              {
                $set: {
                  email: `${docs[i].email}_duplicate_${i}_${Date.now()}`,
                  isActive: false
                }
              }
            );
          }
        }
        console.log(`🔧 Fixed duplicate emails by modifying duplicates`);
      }
      
      // Check for duplicate contacts
      const duplicateContacts = await collection.aggregate([
        { $match: { contact: { $exists: true, $ne: null, $ne: "" } } },
        { $group: { _id: "$contact", count: { $sum: 1 }, docs: { $push: "$$ROOT" } } },
        { $match: { count: { $gt: 1 } } }
      ]).toArray();
      
      if (duplicateContacts.length > 0) {
        console.log(`⚠️ Found ${duplicateContacts.length} duplicate contact groups`);
        
        for (const group of duplicateContacts) {
          // Keep the first document, mark others as inactive with modified contacts
          const docs = group.docs;
          for (let i = 1; i < docs.length; i++) {
            await collection.updateOne(
              { _id: docs[i]._id },
              {
                $set: {
                  contact: `${docs[i].contact}_dup_${i}_${Date.now()}`,
                  isActive: false
                }
              }
            );
          }
        }
        console.log(`🔧 Fixed duplicate contacts by modifying duplicates`);
      }
      
      console.log('✅ Data cleanup completed');
      
    } catch (error) {
      console.error('❌ Error during data cleanup:', error);
      console.log('⚠️ Proceeding without data cleanup...');
    }
  }
}

export default UserRepository; 