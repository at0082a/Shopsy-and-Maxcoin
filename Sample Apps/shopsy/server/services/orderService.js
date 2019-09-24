const models = require('../models/sequelize');

let client = null;
let models = null;

async function inTransaction(work) {
  const t = await client.transaction();

  try {
    await work(t);
  } catch(err) {
    t.rollback();
    throw err;
  } 
}

async function create(user, items, t) {
  const order = await models.Order.create({
    userId: user.email,
    email: user.email,
    status: 'Not shipped'
  }, {transaction: t});
  
  return Promise.all (items.map (async (item) => {
    const orderItem = await models.OrderItem.create({
      sku: item.sku,
      name: item.name,
      qty: item.qty,
      price: item.price
    }); 
    return order.addOrderItem(orderItem, {transaction: t});
  }));
}

module.exports = (_client) => {
  models = Models(_client);
  client = _client;

  return {
    create,
    inTransaction,
  };
};