const { default: mongoose } = require("mongoose");

const Schema = mongoose.Schema;

const productScheme = new Schema(
  {
    title: String,
    link: String,
    saledCount: Number,
    returnCount: Number,
    statusSKU: String,
    statusCard: String,
    status: String,
    rating: Number,
    sku: { type: String, unique: true },
    productId: Number,
  },
  { versionKey: false }
);

const ProductModel = mongoose.model("Product", productScheme);

module.exports = ProductModel;
