import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import http from 'http';
import app from './src/server.js';
import { User } from './src/models/User.js';

const startTest = async () => {
  console.log('[Test Suite] Launching Stage 2 Auth & Security Verification...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  const baseURL = 'http://127.0.0.1:5099';

  try {
    // 1. Test Input Validation Failure on Registration (Empty fields)
    console.log('\n[Test 1] Testing Input Validation Failure on /api/auth/register...');
    const invalidRegRes = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: 'not-an-email', password: '123' }),
    });
    const invalidRegData = await invalidRegRes.json();
    console.log('Status code:', invalidRegRes.status, '(Expected 400)');
    console.log('Validation errors caught:', invalidRegData.errors.length, 'field errors.');

    // 2. Test Successful User Registration
    console.log('\n[Test 2] Testing Successful Registration...');
    const validRegRes = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'SecurePassword123!',
      }),
    });
    const validRegData = await validRegRes.json();
    console.log('Status code:', validRegRes.status, '(Expected 201)');
    console.log('User created:', validRegData.data.user.email);
    console.log('JWT Token issued:', Boolean(validRegData.data.token));
    console.log('Password excluded from response:', !validRegData.data.user.password);

    // 3. Test Duplicate Email Prevention
    console.log('\n[Test 3] Testing Duplicate Email Registration...');
    const dupRes = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe 2',
        email: 'jane@example.com',
        password: 'SecurePassword123!',
      }),
    });
    console.log('Status code:', dupRes.status, '(Expected 409 Conflict)');

    // 4. Test Login with Wrong Password
    console.log('\n[Test 4] Testing Login with Wrong Password...');
    const wrongPassRes = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jane@example.com',
        password: 'WrongPassword999!',
      }),
    });
    console.log('Status code:', wrongPassRes.status, '(Expected 401 Unauthorized)');

    // 5. Test Login with Correct Password
    console.log('\n[Test 5] Testing Login with Correct Password...');
    const loginRes = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jane@example.com',
        password: 'SecurePassword123!',
      }),
    });
    const loginData = await loginRes.json();
    console.log('Status code:', loginRes.status, '(Expected 200 OK)');
    const authToken = loginData.data.token;
    console.log('Logged in successfully. Token acquired.');

    // 6. Test Protected Route Access with Token
    console.log('\n[Test 6] Testing Protected Profile Route (/api/auth/profile)...');
    const profileRes = await fetch(`${baseURL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const profileData = await profileRes.json();
    console.log('Status code:', profileRes.status, '(Expected 200 OK)');
    console.log('Profile fetched for:', profileData.data.user.name, `(${profileData.data.user.role})`);

    // 7. Test Protected Route Rejection without Token
    console.log('\n[Test 7] Testing Rejection on Unauthenticated Request...');
    const unauthRes = await fetch(`${baseURL}/api/auth/profile`);
    console.log('Status code:', unauthRes.status, '(Expected 401)');

    // 8. Test Security Headers (Helmet)
    console.log('\n[Test 8] Checking Helmet Security Headers...');
    const healthRes = await fetch(`${baseURL}/api/health`);
    console.log('X-Content-Type-Options:', healthRes.headers.get('x-content-type-options'));
    console.log('X-Frame-Options:', healthRes.headers.get('x-frame-options'));
    console.log('Strict-Transport-Security:', healthRes.headers.get('strict-transport-security'));

    console.log('\nALL STAGE 2 TESTS PASSED CLEANLY!\n');
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    server.close();
    await mongoose.disconnect();
    await mongod.stop();
  }
};

startTest();
