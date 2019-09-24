module.exports = (sequelize, DataTypes) => {

  // Implement schema here

  const Order = sequelize.define('Order', {
    userID: DataTypes.STRING(24),
    email: DataTypes.STRING,
    status: DataTypes.STRING,
  });
  Order.associate = models => Order.hasMany(models.OrderItem);
  return Order;
};

