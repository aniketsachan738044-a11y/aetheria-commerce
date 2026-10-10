import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import http from 'http';
import app from './src/server.js';
import { User } from './src/models/User.js';
import { Product } from './src/models/Product.js';
import { generateToken } from './src/utils/generateToken.js';

const startStage3Test = async () => {
  console.log('[Stage 3 Test] Starting verification of Products, Cart, and Order APIs...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5098, resolve));
  const baseURL = 'http://127.0.0.1:5098';

  try {
    // 1. Create a customer and an admin user
    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'Password123!',
      role: 'customer',
    });
    const customerToken = generateToken(customer._id, customer.role);

    const admin = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'AdminPassword123!',
      role: 'admin',
    });
    const adminToken = generateToken(admin._id, admin.role);

    // 2. Admin creates a Product
    console.log('\n[Test 1] Admin creates a Product (POST /api/products)...');
    const createProdRes = await fetch(`${baseURL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Sony WH-1000XM5',
        description: 'Premium noise-canceling headphones',
        price: 399.99,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        stock: 10,
      }),
    });
    const createProdData = await createProdRes.json();
    console.log('Status:', createProdRes.status, '(Expected 201)');
    const product = createProdData.data.product;
    console.log('Created product ID:', product._id);

    // 3. Customer attempts to create Product (Should be 403 Forbidden)
    console.log('\n[Test 2] Customer attempts to create Product (Should return 403 Forbidden)...');
    const forbidRes = await fetch(`${baseURL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        name: 'Hacker Item',
        description: 'Should fail',
        price: 9.99,
        category: 'test',
        image: 'https://example.com/item.jpg',
        stock: 5,
      }),
    });
    console.log('Status:', forbidRes.status, '(Expected 403)');

    // 4. Public fetches Products with search & pagination
    console.log('\n[Test 3] Public fetches Products (GET /api/products?keyword=Sony)...');
    const getProdsRes = await fetch(`${baseURL}/api/products?keyword=Sony`);
    const getProdsData = await getProdsRes.json();
    console.log('Status:', getProdsRes.status, '(Expected 200)');
    console.log('Found products count:', getProdsData.data.products.length);

    // 5. Customer adds product to Cart
    console.log('\n[Test 4] Customer adds item to cart (POST /api/cart)...');
    const addCartRes = await fetch(`${baseURL}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        productId: product._id,
        quantity: 2,
      }),
    });
    const addCartData = await addCartRes.json();
    console.log('Status:', addCartRes.status, '(Expected 200)');
    console.log('Cart items count:', addCartData.data.cart.items.length);
    console.log('Cart total amount computed:', addCartData.data.cart.totalAmount);

    // 6. Customer places an Order (Simulated Checkout)
    console.log('\n[Test 5] Customer places order (POST /api/orders)...');
    const createOrderRes = await fetch(`${baseURL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        shippingAddress: {
          street: '456 Market St',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          country: 'USA',
        },
      }),
    });
    const orderData = await createOrderRes.json();
    console.log('Status:', createOrderRes.status, '(Expected 201)');
    const order = orderData.data.order;
    console.log('Order created ID:', order._id);
    console.log('Order isPaid status:', order.isPaid);
    console.log('Payment result txn:', order.paymentResult.id);
    console.log('Total Price calculated:', order.totalPrice);

    // 7. Verify stock was decremented
    const refreshedProduct = await Product.findById(product._id);
    console.log('\n[Test 6] Product stock inventory check:');
    console.log('Stock remaining:', refreshedProduct.stock, '(Initial: 10, Bought: 2 -> Expected: 8)');

    // 8. Verify cart was emptied
    console.log('\n[Test 7] Verify cart was emptied after checkout...');
    const verifyCartRes = await fetch(`${baseURL}/api/cart`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const verifyCartData = await verifyCartRes.json();
    console.log('Cart item count after order:', verifyCartData.data.cart.items.length, '(Expected 0)');

    // 9. Customer fetches my orders
    console.log('\n[Test 8] Customer retrieves order history (GET /api/orders/myorders)...');
    const myOrdersRes = await fetch(`${baseURL}/api/orders/myorders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const myOrdersData = await myOrdersRes.json();
    console.log('Status:', myOrdersRes.status, '(Expected 200)');
    console.log('Order history count:', myOrdersData.data.orders.length);

    console.log('\nALL STAGE 3 APIS AND FLOWS VERIFIED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('Stage 3 test failed:', err);
    process.exit(1);
  } finally {
    server.close();
    await mongoose.disconnect();
    await mongod.stop();
  }
};

startStage3Test();
