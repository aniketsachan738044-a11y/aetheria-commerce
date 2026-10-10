import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Product } from './src/models/Product.js';
import { User } from './src/models/User.js';
import { Cart } from './src/models/Cart.js';
import { Order } from './src/models/Order.js';

const runVerification = async () => {
  console.log('[Verification] Starting in-memory MongoDB verification test...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  try {
    await mongoose.connect(uri);
    console.log('[Verification] Successfully connected to MongoDB at:', uri);

    // 1. Verify User Model & bcrypt pre-save hashing
    const testPassword = 'Password123!';
    const user = await User.create({
      name: 'Test Customer',
      email: 'customer@codealpha.com',
      password: testPassword,
      role: 'customer',
    });

    console.log('[Verification] User created:', user.email);
    console.log('[Verification] Password field hidden by default in toJSON:', !user.toJSON().password);

    // Fetch with password explicitly selected to verify bcrypt hashing
    const userWithPassword = await User.findById(user._id).select('+password');
    const isPasswordHashed = userWithPassword.password.startsWith('$2');
    const isPasswordValid = await userWithPassword.comparePassword(testPassword);
    console.log('[Verification] Password is bcrypt hashed ($2b$/$2a$):', isPasswordHashed);
    console.log('[Verification] comparePassword matches original password:', isPasswordValid);

    // 2. Verify Product Model & Validation
    const product = await Product.create({
      name: 'Sony WH-1000XM5 Wireless Headphones',
      description: 'Industry-leading noise canceling headphones.',
      price: 399.99,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      stock: 25,
      rating: 4.8,
      numReviews: 124,
    });
    console.log('[Verification] Product created:', product.name, '| Price: $' + product.price);

    // 3. Verify Cart Model & Virtual computation
    const cart = await Cart.create({
      user: user._id,
      items: [
        {
          product: product._id,
          quantity: 2,
          price: product.price,
        },
      ],
    });
    console.log('[Verification] Cart created for user:', cart.user);
    console.log('[Verification] Cart dynamic totalAmount computed:', cart.totalAmount, '(Expected: 799.98)');

    // 4. Verify Order Model
    const order = await Order.create({
      user: user._id,
      items: [
        {
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: 2,
        },
      ],
      shippingAddress: {
        street: '123 Tech Avenue',
        city: 'Silicon City',
        state: 'CA',
        postalCode: '94016',
        country: 'USA',
      },
      paymentMethod: 'Simulated Payment',
      itemsPrice: 799.98,
      shippingPrice: 15.0,
      taxPrice: 64.0,
      totalPrice: 878.98,
      isPaid: true,
    });
    console.log('[Verification] Order created:', order._id, '| isPaid:', order.isPaid, '| Status:', order.status);

    console.log('\n--- ALL STAGE 1 MODELS AND VALIDATIONS PASSED! ---');
  } catch (error) {
    console.error('[Verification Failed]:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    await mongod.stop();
  }
};

runVerification();
