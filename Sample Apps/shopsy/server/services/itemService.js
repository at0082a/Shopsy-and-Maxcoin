const ItemModel = require('../models/mongoose/Item');

async function getAll() {
  return ItemModel.find({}).sort({ createdAt: -1 });
}

async function getOne(itemId) {
  return ItemModel.findOne({ _id: itemId });
}

async function create(data) {
  const item = new ItemModel(data);
  return item.save();
}

async function update(itemId, data) {
  const item = await getOne(itemId);
  if (!item) {
    throw new Error('could not find requested item');
  }
  Object.keys(data).forEach((key) => {
    item[key] = data[key];
  });
  return item.save();
}

async function remove(itemId) {
  const result = await ItemModel.remove(itemId);
  return result.result.n;
}

module.exports = {
  getOne,
  getAll,
  update,
  create,
  remove,
};
