import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Product description cannot exceed 2000 characters'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0.01, 'Price must be greater than zero'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required'],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
      default: 4.5,
    },
    numReviews: {
      type: Number,
      min: [0, 'Review count cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality
productSchema.index({ name: 'text', description: 'text', category: 'text' });

export const Product = mongoose.model('Product', productSchema);
