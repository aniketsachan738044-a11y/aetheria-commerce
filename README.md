# CodeAlpha E-Commerce Store

A production-grade, secure, modern full-stack E-Commerce platform built with **React 18**, **Node.js 20 LTS**, **Express 4**, and **MongoDB 7 / Mongoose 8**.

---

## 🚀 Key Features

- **Storefront & Product Discovery**:
  - Full-text keyword search and category filtering (`Electronics`, `Accessories`, `Audio`, `Bags`, `Lifestyle`).
  - Server-side pagination metadata.
  - Detailed product view with inventory tracking, review metrics, and responsive image views.
- **Cart & Simulated Checkout**:
  - User-bound persistent cart synchronized with the database.
  - Dynamic stock validation preventing over-ordering.
  - Automated cost breakdown (subtotal, conditional free shipping over \$100, 8% estimated sales tax).
  - Simulated payment processing (order marked `paid` instantly with simulated transaction ID).
- **Authentication & RBAC**:
  - JWT authentication with secure short-lived access tokens.
  - Bcrypt password hashing (salt rounds = 12).
  - Server-side Role-Based Access Control (`customer` vs `admin`).
- **User Dashboard**:
  - Profile inspection and detailed order history with itemized line items.
- **Enterprise-Grade Security (0 Vulnerabilities)**:
  - Strict Helmet HTTP headers (`nosniff`, `SAMEORIGIN`, CSP).
  - Strict CORS whitelist (no wildcards allowed).
  - Brute-force rate limiting (general limiter + strict auth limiter).
  - Server-side validation and sanitization using `express-validator`.
  - Client-side XSS defense powered by `DOMPurify`.
  - Passwords stripped in Mongoose `select: false` and `toJSON` transforms.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18.3, React Router 6.30, Tailwind CSS 3.4, Vite 5.4, Axios, Lucide Icons, DOMPurify |
| **Backend** | Node.js 20 LTS, Express 4.21, Mongoose 8.9, jsonwebtoken, bcrypt, helmet, cors, express-rate-limit, express-validator |
| **Database** | MongoDB 7 |

---

## 📂 Project Structure

```text
CodeAlpha_EcommerceStore/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration (db.js)
│   │   ├── controllers/     # Controllers (auth, product, cart, order)
│   │   ├── middleware/      # Auth JWT, RBAC authorize, express-validator runner
│   │   ├── models/          # User, Product, Cart, Order Mongoose schemas
│   │   ├── routes/          # Express route declarations
│   │   ├── seeds/           # Database seeder (seed.js) with 10 sample products
│   │   ├── utils/           # JWT generator utility
│   │   ├── validators/      # Validation & sanitization rules
│   │   └── server.js        # Express app entry & security middlewares
│   ├── .env.example
│   ├── package.json
│   └── verify-models.js     # Verification suite
└── frontend/
    ├── src/
    │   ├── components/      # Navbar, ProductCard, ProtectedRoute
    │   ├── context/         # AuthContext, CartContext
    │   ├── pages/           # HomePage, ProductDetailPage, CartPage, CheckoutPage, LoginPage, RegisterPage, DashboardPage
    │   ├── services/        # Centralized Axios instance (api.js)
    │   ├── utils/           # DOMPurify sanitization
    │   ├── App.jsx          # Router & layout
    │   └── main.jsx         # React root
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js $\ge 18.x$ (Node 20 LTS recommended)
- MongoDB instance (MongoDB Atlas URI or local MongoDB daemon)

### 1. Backend Setup
```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env
```

Configure `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/codealpha_ecommerce
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=1h
CLIENT_URL=http://localhost:5173
```

Run seed script (creates 10 products and default test admin):
```bash
npm run seed
```

Start backend development server:
```bash
npm run dev
# Server will run on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install

# Copy environment variables
cp .env.example .env
```

Ensure `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend development server:
```bash
npm run dev
# Vite will serve at http://localhost:5173
```

---

## 🔐 Default Seed Credentials

After running `npm run seed`:
- **Admin Email**: `admin@codealpha.com`
- **Admin Password**: `AdminPass123!`
- **Role**: `admin`

---

## 📡 API Reference Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new customer account (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive signed JWT |
| `GET` | `/api/auth/profile` | Protected | Fetch current logged-in user profile |

### Products (`/api/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | List products (queries: `keyword`, `category`, `page`, `limit`) |
| `GET` | `/api/products/:id` | Public | Retrieve single product by ObjectID |
| `POST` | `/api/products` | Admin | Create product (`name`, `description`, `price`, `category`, `image`, `stock`) |
| `PUT` | `/api/products/:id` | Admin | Update existing product details |
| `DELETE`| `/api/products/:id` | Admin | Delete product from catalog |

### Cart (`/api/cart`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart` | Protected | Fetch current user's active cart & items |
| `POST` | `/api/cart` | Protected | Add item or increment quantity (`productId`, `quantity`) |
| `PUT` | `/api/cart/:productId` | Protected | Update quantity of specific item |
| `DELETE`| `/api/cart/:productId` | Protected | Remove item from cart |
| `DELETE`| `/api/cart` | Protected | Clear entire cart |

### Orders & Checkout (`/api/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Protected | Create order from cart (simulated checkout, marks paid) |
| `GET` | `/api/orders/myorders` | Protected | Retrieve authenticated customer's order history |
| `GET` | `/api/orders/:id` | Protected | Retrieve order details (owner or admin) |
| `GET` | `/api/orders` | Admin | Retrieve all orders across the store |

---

## 🚢 Production Deployment Checklist

### 1. MongoDB Atlas Setup
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a database user with read/write permissions.
3. Under **Network Access**, whitelist your deployment IP addresses (or `0.0.0.0/0` with secure credentials).
4. Retrieve connection string (e.g. `mongodb+srv://<user>:<password>@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority`).

### 2. Backend Deployment (Render / Railway / Fly.io)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Required Production Environment Variables**:
  ```env
  NODE_ENV=production
  PORT=5000
  MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
  JWT_SECRET=<64_CHAR_HEX_OR_RANDOM_STRING_CRYPTO_SECURE>
  JWT_EXPIRES_IN=1h
  CLIENT_URL=https://your-frontend-domain.vercel.app
  ```

### 3. Frontend Deployment (Vercel / Netlify)
- **Root Directory**: `frontend`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Required Production Environment Variables**:
  ```env
  VITE_API_URL=https://your-backend-api.onrender.com/api
  ```
- **SPA Routing Configuration** (`vercel.json` rewrite):
  Ensure single-page app rewrites are enabled so direct page reloads don't return 404:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/" }]
  }
  ```
