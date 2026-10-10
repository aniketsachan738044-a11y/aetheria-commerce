import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();

// 1. Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// 2. Strict CORS Whitelisting
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      
      const isAllowedExplicit = allowedOrigins.includes(origin);
      const isVercelDeploy = /\.vercel\.app$/.test(origin);

      if (isAllowedExplicit || isVercelDeploy) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy violation: Access denied from this origin.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Rate Limiting to prevent DoS & brute force attacks
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Stricter limit for login/register brute-force prevention
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 4. Request Body Parsing with size limits to prevent body-overflow attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Aetheria Commerce API is healthy and operational.',
    timestamp: new Date().toISOString(),
  });
});

// 6. Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// 7. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// 8. Global Centralized Error Handling Middleware (no stack traces leaked in production)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[Unhandled Error] ${err.message}`);

  res.status(statusCode).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An internal server error occurred.'
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

// Connect to Database and start listening if not running under a test runner
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] Production-ready Express listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  }).catch((err) => {
    console.error(`[Server Error] DB initialization failure: ${err.message}`);
  });
}

export default app;
