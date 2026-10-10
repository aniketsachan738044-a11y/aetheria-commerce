import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Item price cannot be negative'],
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One active persistent cart per user
      index: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

// Virtual field for cart total amount calculated dynamically
cartSchema.virtual('totalAmount').get(function () {
  return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

export const Cart = mongoose.model('Cart', cartSchema);
