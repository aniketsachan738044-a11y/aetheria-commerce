import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';

/**
 * @desc    Get current user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        products: wishlist.products,
      },
    });
  } catch (error) {
    console.error(`[Get Wishlist Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve wishlist.',
    });
  }
};

/**
 * @desc    Toggle product in wishlist (Add if not present, remove if present)
 * @route   POST /api/wishlist/toggle/:productId
 * @access  Private
 */
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.',
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const index = wishlist.products.findIndex(
      (p) => p.toString() === productId.toString()
    );

    let isAdded = false;
    if (index > -1) {
      wishlist.products.splice(index, 1);
      isAdded = false;
    } else {
      wishlist.products.push(productId);
      isAdded = true;
    }

    await wishlist.save();
    const populated = await Wishlist.findById(wishlist._id).populate('products');

    return res.status(200).json({
      status: 'success',
      message: isAdded ? 'Added to wishlist' : 'Removed from wishlist',
      data: {
        isAdded,
        products: populated.products,
      },
    });
  } catch (error) {
    console.error(`[Toggle Wishlist Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update wishlist.',
    });
  }
};

/**
 * @desc    Remove single product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (p) => p.toString() !== productId.toString()
      );
      await wishlist.save();
    }

    const populated = await Wishlist.findOne({ user: req.user._id }).populate('products');

    return res.status(200).json({
      status: 'success',
      message: 'Item removed from wishlist',
      data: {
        products: populated ? populated.products : [],
      },
    });
  } catch (error) {
    console.error(`[Remove Wishlist Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to remove product from wishlist.',
    });
  }
};
