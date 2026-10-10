import { Product } from '../models/Product.js';

/**
 * @desc    Fetch all products with pagination, search, and category filtering
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by category
    if (req.query.category && req.query.category.trim() !== '') {
      query.category = { $regex: new RegExp(`^${req.query.category.trim()}$`, 'i') };
    }

    // Filter by keyword search (name, description)
    if (req.query.keyword && req.query.keyword.trim() !== '') {
      const keywordRegex = { $regex: req.query.keyword.trim(), $options: 'i' };
      query.$or = [{ name: keywordRegex }, { description: keywordRegex }];
    }

    // Filter by price range
    if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
      query.price = {};
      if (req.query.minPrice !== undefined && req.query.minPrice !== '') {
        query.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice !== undefined && req.query.maxPrice !== '') {
        query.price.$lte = Number(req.query.maxPrice);
      }
    }

    // Filter by in-stock status
    if (req.query.inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Dynamic sort
    let sortOption = { createdAt: -1 };
    if (req.query.sortBy === 'price_asc') {
      sortOption = { price: 1 };
    } else if (req.query.sortBy === 'price_desc') {
      sortOption = { price: -1 };
    } else if (req.query.sortBy === 'rating') {
      sortOption = { rating: -1, numReviews: -1 };
    } else if (req.query.sortBy === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      status: 'success',
      data: {
        products,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  } catch (error) {
    console.error(`[Get Products Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve products.',
    });
  }
};

/**
 * @desc    Fetch single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    console.error(`[Get Product By ID Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve product details.',
    });
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: { product },
    });
  } catch (error) {
    console.error(`[Create Product Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create product.',
    });
  }
};

/**
 * @desc    Update an existing product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.',
      });
    }

    const { name, description, price, category, image, stock } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (image !== undefined) product.image = image;
    if (stock !== undefined) product.stock = stock;

    const updatedProduct = await product.save();

    return res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: { product: updatedProduct },
    });
  } catch (error) {
    console.error(`[Update Product Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update product.',
    });
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error(`[Delete Product Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete product.',
    });
  }
};

/**
 * @desc    Create new review for a product
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found.',
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      // Update their existing review
      alreadyReviewed.rating = Number(rating);
      alreadyReviewed.comment = comment.trim();
    } else {
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment: comment.trim(),
        user: req.user._id,
      };
      product.reviews.push(review);
    }

    product.numReviews = product.reviews.length;
    product.rating = Number(
      (
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length
      ).toFixed(1)
    );

    await product.save();

    return res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully',
      data: {
        rating: product.rating,
        numReviews: product.numReviews,
        reviews: product.reviews,
      },
    });
  } catch (error) {
    console.error(`[Create Review Error]: ${error.message}`);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to submit review.',
    });
  }
};
