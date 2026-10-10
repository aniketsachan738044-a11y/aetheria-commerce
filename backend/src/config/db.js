import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongodInstance = null;

/**
 * Connects to MongoDB database.
 * If local MongoDB is unavailable in development mode, automatically falls back
 * to a seamless in-memory MongoDB instance with pre-seeded data so the app runs out-of-the-box.
 */
export const connectDB = async () => {
  const primaryURI = process.env.MONGODB_URI;

  try {
    if (!primaryURI) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }

    // Try connecting with a 2-second timeout
    const conn = await mongoose.connect(primaryURI, {
      serverSelectionTimeoutMS: 2000,
      autoIndex: true,
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[Database Error] Connection failed: ${error.message}`);
      process.exit(1);
    }

    console.warn(`[Database Notice] Could not connect to primary MongoDB (${error.message}).`);
    console.log(`[Database] Starting integrated in-memory MongoDB development server...`);

    mongodInstance = await MongoMemoryServer.create();
    const memUri = mongodInstance.getUri();

    await mongoose.connect(memUri);
    console.log(`[Database] In-memory MongoDB Connected at: ${memUri}`);

    // Auto-seed initial catalog and admin user
    try {
      const { seedInMemory } = await import('../seeds/seedInMemory.js');
      await seedInMemory();
      console.log(`[Database] Initial products and test admin auto-seeded!`);
    } catch (seedErr) {
      console.warn(`[Database Notice] Seeding skipped: ${seedErr.message}`);
    }
  }
};
