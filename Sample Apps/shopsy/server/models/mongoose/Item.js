const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema ({
  sku: { type: Number, required: true, index: {unique: true } },
  name: { type: String, required: true, index: true },
  price: { type: Number, required: true, index: false },
}, { timestamps: true });


module.exports = ('Item', ItemSchema);
