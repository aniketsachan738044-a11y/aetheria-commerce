import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { connectDB } from '../config/db.js';
import { indianMarketProducts } from './seedInMemory.js';

dotenv.config();

export const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing products...');
    await Product.deleteMany({});

    console.log(`[Seed] Inserting ${indianMarketProducts.length} curated products...`);
    const insertedProducts = await Product.insertMany(indianMarketProducts);
    console.log(`[Seed] Successfully seeded ${insertedProducts.length} products!`);

    const adminAccounts = [
      { name: 'Aetheria Admin', email: 'admin@aetheria.in', password: 'AdminPass123!', role: 'admin' },
      { name: 'System Admin', email: 'admin@codealpha.com', password: 'AdminPass123!', role: 'admin' },
    ];

    for (const acc of adminAccounts) {
      const exists = await User.findOne({ email: acc.email });
      if (!exists) {
        await User.create(acc);
        console.log(`[Seed] Created admin account: ${acc.email}`);
      }
    }

    console.log('[Seed] Database seeding completed successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Seeding failed: ${error.message}`);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Execute if run directly from CLI
if (process.argv[1].endsWith('seed.js')) {
  seedData();
}
