import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';

/**
 * @desc    Create new order from current user's cart (Simulated payment)
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot place order with an empty cart.',
      });
    }

    // Verify stock availability and prepare order items
    const orderItems = [];
    let itemsPrice = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: `Product ${item.product.name || 'in cart'} is no longer available.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient stock for ${product.name}. Only ${product.stock} remaining.`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });

      itemsPrice += product.price * item.quantity;

      // Decrement stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Pricing calculation (INR)
    itemsPrice = Math.round(itemsPrice);
    const shippingPrice = itemsPrice >= 999 ? 0 : 99; // Free delivery across India on orders >= ₹999
    const taxPrice = Math.round(itemsPrice * 0.18); // 18% GST (Standard Indian Consumer Electronics / Goods rate)
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Create Order with simulated payment marked paid
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: 'Simulated Payment',
      paymentResult: {
        id: `SIM_TXN_${Date.now()}`,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
      },
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: true,
      paidAt: new Date(),
      status: 'Processing',
    });

    // Clear cart after order creation
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      status: 'success',
      message: 'Order placed and payment simulated successfully',
      data: { order },
    });
  } catch (error) {
    console.error(`[Create Order Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create order.',
    });
  }
};

/**
 * @desc    Get order history for logged in user
 * @route   GET /api/orders/myorders
 * @access  Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      data: { orders },
    });
  } catch (error) {
    console.error(`[Get My Orders Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve order history.',
    });
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found.',
      });
    }

    // Authorization: User can view their own order; Admins can view any order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You do not have permission to view this order.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (error) {
    console.error(`[Get Order By ID Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve order details.',
    });
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      data: { orders },
    });
  } catch (error) {
    console.error(`[Get All Orders Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve all orders.',
    });
  }
};
