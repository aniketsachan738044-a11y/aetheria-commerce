import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price image stock category',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    return res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } catch (error) {
    console.error(`[Get Cart Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve cart.',
    });
  }
};

/**
 * @desc    Add item to cart or increment quantity
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        status: 'error',
        message: `Requested quantity exceeds available stock (${product.stock} available).`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQty = cart.items[existingItemIndex].quantity + quantity;
      if (newQty > product.stock) {
        return res.status(400).json({
          status: 'error',
          message: `Cannot add more. Total in cart would exceed stock (${product.stock} available).`,
        });
      }
      cart.items[existingItemIndex].quantity = newQty;
      cart.items[existingItemIndex].price = product.price; // Update with latest price
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name price image stock category',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Item added to cart',
      data: { cart },
    });
  } catch (error) {
    console.error(`[Add To Cart Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to add item to cart.',
    });
  }
};

/**
 * @desc    Update quantity of specific item in cart
 * @route   PUT /api/cart/:productId
 * @access  Private
 */
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.',
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        status: 'error',
        message: `Quantity exceeds available stock (${product.stock} available).`,
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found.',
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not in cart.',
      });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price;
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name price image stock category',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Cart updated',
      data: { cart },
    });
  } catch (error) {
    console.error(`[Update Cart Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update cart.',
    });
  }
};

/**
 * @desc    Remove an item from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found.',
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name price image stock category',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Item removed from cart',
      data: { cart },
    });
  } catch (error) {
    console.error(`[Remove Cart Item Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to remove item from cart.',
    });
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({
      status: 'success',
      message: 'Cart cleared successfully',
      data: { items: [], totalAmount: 0 },
    });
  } catch (error) {
    console.error(`[Clear Cart Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to clear cart.',
    });
  }
};
