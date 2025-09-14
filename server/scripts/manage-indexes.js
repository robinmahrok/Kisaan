#!/usr/bin/env node

/**
 * Database Index Management Script
 * 
 * Usage:
 *   node scripts/manage-indexes.js list
 *   node scripts/manage-indexes.js create
 *   node scripts/manage-indexes.js drop [index-name]
 *   node scripts/manage-indexes.js recreate
 */

import dbConnection from '../config/database.js';
import { initializeAllIndexes } from '../repositories/index.js';

const command = process.argv[2];
const indexName = process.argv[3];

async function listIndexes() {
  try {
    const db = dbConnection.getDb();
    const collections = ['signups', 'bankinfos', 'seedinfos', 'sellerinfos', 'requestinfos', 'transactions'];
    
    console.log('📋 Current Database Indexes:\n');
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.listIndexes().toArray();
        
        console.log(`📁 Collection: ${collectionName}`);
        console.log('─'.repeat(50));
        
        if (indexes.length === 0) {
          console.log('   No indexes found');
        } else {
          indexes.forEach(index => {
            const unique = index.unique ? ' (UNIQUE)' : '';
            const background = index.background ? ' (BACKGROUND)' : '';
            console.log(`   • ${index.name}: ${JSON.stringify(index.key)}${unique}${background}`);
          });
        }
        console.log('');
      } catch (error) {
        console.log(`   ❌ Error accessing collection: ${error.message}\n`);
      }
    }
  } catch (error) {
    console.error('❌ Error listing indexes:', error.message);
  }
}

async function createIndexes() {
  try {
    console.log('🔧 Creating/updating all indexes...\n');
    await initializeAllIndexes();
    console.log('\n✅ Index creation completed');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
}

async function dropIndex() {
  if (!indexName) {
    console.error('❌ Please specify an index name to drop');
    console.log('Usage: node scripts/manage-indexes.js drop <index-name>');
    return;
  }
  
  try {
    const db = dbConnection.getDb();
    const collections = ['signups', 'bankinfos', 'seedinfos', 'sellerinfos', 'requestinfos', 'transactions'];
    
    console.log(`🗑️ Dropping index "${indexName}" from all collections...\n`);
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        await collection.dropIndex(indexName);
        console.log(`✅ Dropped ${indexName} from ${collectionName}`);
      } catch (error) {
        if (error.message.includes('index not found')) {
          console.log(`ℹ️ Index ${indexName} not found in ${collectionName}`);
        } else {
          console.log(`❌ Error dropping ${indexName} from ${collectionName}: ${error.message}`);
        }
      }
    }
    console.log('\n✅ Drop operation completed');
  } catch (error) {
    console.error('❌ Error dropping index:', error.message);
  }
}

async function recreateIndexes() {
  try {
    console.log('🔄 Recreating all indexes...\n');
    
    // First, drop problematic indexes
    const problematicIndexes = ['email_1', 'contact_1'];
    
    for (const indexName of problematicIndexes) {
      console.log(`🗑️ Dropping potentially problematic index: ${indexName}`);
      const db = dbConnection.getDb();
      const collection = db.collection('signups');
      
      try {
        await collection.dropIndex(indexName);
        console.log(`✅ Dropped ${indexName}`);
      } catch (error) {
        if (error.message.includes('index not found')) {
          console.log(`ℹ️ Index ${indexName} not found`);
        } else {
          console.log(`⚠️ Could not drop ${indexName}: ${error.message}`);
        }
      }
    }
    
    console.log('\n🔧 Creating new indexes...');
    await initializeAllIndexes();
    console.log('\n✅ Index recreation completed');
  } catch (error) {
    console.error('❌ Error recreating indexes:', error.message);
  }
}

async function main() {
  try {
    // Connect to database
    await dbConnection.connect();
    
    switch (command) {
      case 'list':
        await listIndexes();
        break;
      case 'create':
        await createIndexes();
        break;
      case 'drop':
        await dropIndex();
        break;
      case 'recreate':
        await recreateIndexes();
        break;
      default:
        console.log('📚 Database Index Management Script\n');
        console.log('Available commands:');
        console.log('  list      - List all indexes in all collections');
        console.log('  create    - Create/update all indexes');
        console.log('  drop      - Drop a specific index from all collections');
        console.log('  recreate  - Drop problematic indexes and recreate all\n');
        console.log('Usage examples:');
        console.log('  node scripts/manage-indexes.js list');
        console.log('  node scripts/manage-indexes.js create');
        console.log('  node scripts/manage-indexes.js drop email_1');
        console.log('  node scripts/manage-indexes.js recreate');
        break;
    }
  } catch (error) {
    console.error('❌ Script error:', error.message);
  } finally {
    // Close database connection
    await dbConnection.disconnect();
    process.exit(0);
  }
}

// Run the script
main().catch(console.error); 