import BaseRepository from './BaseRepository.js';
import UserRepository from './UserRepository.js';

// Create repository instances
const userRepository = new UserRepository();

// Additional repositories can be added here as you create them
// For now, we'll create basic repositories for other collections
const bankRepository = new BaseRepository('bankinfos');
const seedRepository = new BaseRepository('seedinfos');
const sellerRepository = new BaseRepository('sellerinfos');
const requestRepository = new BaseRepository('requestinfos');
const transactionRepository = new BaseRepository('transactions');

const repositories = {
  user: userRepository,
  bank: bankRepository,
  seed: seedRepository,
  seller: sellerRepository,
  request: requestRepository,
  transaction: transactionRepository,
  
  // Legacy naming for backward compatibility
  userInfo: userRepository,
  BankInfo: bankRepository,
  SeedInfo: seedRepository,
  SellerInfo: sellerRepository,
  RequestInfo: requestRepository,
  TransactionInfo: transactionRepository
};

export default repositories;

// Named exports for convenience
export const {
  user,
  bank,
  seed,
  seller,
  request,
  transaction,
  userInfo
} = repositories;

// Initialize all indexes
export async function initializeAllIndexes() {
  try {
    console.log('🔧 Initializing database indexes...');
    
    // Initialize user indexes
    await userRepository.initializeIndexes();
    
    // Add other repository index initialization here as needed
    // await bankRepository.initializeIndexes();
    // await seedRepository.initializeIndexes();
    // etc.
    
    console.log('✅ All database indexes initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database indexes:', error);
    throw error;
  }
} 