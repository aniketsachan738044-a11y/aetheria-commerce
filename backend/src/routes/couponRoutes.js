import express from 'express';

const router = express.Router();

const COUPONS = {
  WELCOME10: {
    code: 'WELCOME10',
    type: 'percentage',
    percentage: 10,
    maxDiscount: 1000,
    minOrder: 500,
    description: '10% OFF on orders above ₹500 (Up to ₹1,000)',
  },
  AETHERIA500: {
    code: 'AETHERIA500',
    type: 'flat',
    amount: 500,
    minOrder: 2499,
    description: 'Flat ₹500 OFF on orders above ₹2,499',
  },
  FESTIVE20: {
    code: 'FESTIVE20',
    type: 'percentage',
    percentage: 20,
    maxDiscount: 2000,
    minOrder: 1500,
    description: '20% Festive Savings (Up to ₹2,000) on orders above ₹1,500',
  },
  FREESHIP: {
    code: 'FREESHIP',
    type: 'shipping',
    amount: 99,
    minOrder: 0,
    description: '100% Free Pan-India Express Delivery',
  },
};

/**
 * @desc    Validate promo coupon code
 * @route   POST /api/coupons/validate
 * @access  Public
 */
router.post('/validate', (req, res) => {
  const { code, subtotal } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide a valid coupon code.',
    });
  }

  const normalizedCode = code.toUpperCase().trim();
  const coupon = COUPONS[normalizedCode];

  if (!coupon) {
    return res.status(404).json({
      status: 'error',
      message: `Coupon code "${normalizedCode}" is invalid or expired.`,
    });
  }

  const orderSubtotal = Number(subtotal) || 0;

  if (orderSubtotal < coupon.minOrder) {
    return res.status(400).json({
      status: 'error',
      message: `Coupon "${coupon.code}" requires a minimum order value of ₹${coupon.minOrder.toLocaleString('en-IN')}.`,
    });
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = Math.min(Math.round((orderSubtotal * coupon.percentage) / 100), coupon.maxDiscount);
  } else if (coupon.type === 'flat') {
    discount = coupon.amount;
  } else if (coupon.type === 'shipping') {
    discount = coupon.amount;
  }

  return res.status(200).json({
    status: 'success',
    message: `Coupon ${coupon.code} applied successfully!`,
    data: {
      code: coupon.code,
      discount,
      type: coupon.type,
      description: coupon.description,
    },
  });
});

/**
 * @desc    Get all available public promo coupons
 * @route   GET /api/coupons
 * @access  Public
 */
router.get('/', (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      coupons: Object.values(COUPONS),
    },
  });
});

export default router;
