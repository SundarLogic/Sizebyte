const Product = require("../Models/Product");
const Cart = require("../Models/Cart");
const CartItem = require("../Models/CartItem");
const Order = require("../Models/Order");
const OrderItem = require("../Models/OrderItem");

const sequelize = require("../config/database.js");

exports.checkout = async (req, res, next) => {
  const userId = req.userId;

  let transaction;

  try {
    transaction = await sequelize.transaction();

    const cart = await Cart.findOne({
      where: {
        userId: userId,
      },
      transaction: transaction,
    });
    if (!cart) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Cart is not avilable",
      });
    }
    const cartItems = await CartItem.findAll({
      where: {
        cartId: cart.id,
      },
      transaction: transaction,
    });
    if (cartItems.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      //Finding each product total price module
      const product = await Product.findByPk(cartItem.productId, {
        transaction: transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!product) {
        await transaction.rollback();

        return res.status(404).json({
          message: `Product with ID ${cartItem.productId} not found`,
        });
      }

      if (cartItem.quantity > product.quantity) {
        await transaction.rollback();

        return res.status(400).json({
          message: `Not enough stock available for ${product.name}`,
        });
      }

      const itemTotal = product.price * cartItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product,
        productId: product.id,
        quantity: cartItem.quantity,
        price: product.price,
      });
    }

    const order = await Order.create(
      {
        userId: userId,
        totalAmount: totalAmount,
      },
      {
        transaction: transaction,
      },
    );

    for (const item of orderItems) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        },
        {
          transaction: transaction,
        },
      );
      const product = item.product;

      product.quantity = product.quantity - item.quantity;

      await product.save({
        transaction: transaction,
      });
    }

    for (const cartItem of cartItems) {
      await cartItem.destroy({
        transaction: transaction,
      });
    }

    await transaction.commit();

    return res.status(200).json({
      message: "Checkout Successful",
      orderId: order.id,
      totalAmount: order.totalAmount,
    });
  } catch (err) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  const userId = req.userId;

  try {
    const orders = await Order.findAll({
      where: {
        userId: userId,
      },
      attributes: ["id", "totalAmount", "status"],
    });
    if (orders.length === 0) {
      return res.status(404).json({
        message: "No orders found for this user",
      });
    }

    for (const order of orders) {
      const orderItems = await OrderItem.findAll({
        where: {
          orderId: order.id,
        },
        attributes: ["id", "productId", "quantity", "price"],
      });
      order.dataValues.orderItems = orderItems;

      for (const item of orderItems) {
        const product = await Product.findByPk(item.productId, {
          attributes: ["id", "name", "imageUrl"],
        });
        item.dataValues.product = product;
      }
    }

    return res.status(200).json({
      message: "Orders found",
      orders: orders,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAdminOrders = async (req, res, next) => {
  const adminId = req.adminId;

  try {
    const products = await Product.findAll({
      where: {
        adminId: adminId,
      },
      attributes: ["id", "name", "price", "imageUrl"],
    });
    if (products.length === 0) {
      return res.status(404).json({
        message: "No products found for this admin",
      });
    }

    const adminOrders = [];

    for (const product of products) {
      const orderItems = await OrderItem.findAll({
        where: {
          productId: product.id,
        },
        attributes: ["id", "orderId", "productId", "quantity", "price"],
      });
      for (const orderItem of orderItems) {
        const order = await Order.findByPk(orderItem.orderId, {
          attributes: ["id", "userId", "totalAmount", "status"],
        });
        if (!order) {
          continue;
        }
        adminOrders.push({
          orderId: order.id,
          userId: order.userId,
          totalAmount: order.totalAmount,
          status: order.status,
          product: {
            id: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
          },
          quantity: orderItem.quantity,
          price: orderItem.price,
        });
      }
    }
    if (adminOrders.length === 0) {
      return res.status(404).json({
        message: "No orders found for this admin's products",
      });
    }

    return res.status(200).json({
      message: "Orders found for this admin's products",
      orders: adminOrders,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  const adminId = req.adminId;
  const orderId = req.params.id;
  const { status } = req.body;

  try {
    const allowedStatuses = ["ORDERED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const products = await Product.findAll({
      where: {
        adminId: adminId,
      },
    });

    if (products.length === 0) {
      return res.status(404).json({
        message: "No products found for this admin",
      });
    }

    let authorized = false;

    for (const product of products) {
      const orderitem = await OrderItem.findAll({
        where: {
          orderId: orderId,
          productId: product.id,
        },
      });

      if (orderitem.length > 0) {
        authorized = true;
        break;
      }
    }
    if (!authorized) {
      return res.status(403).json({
        message: "You are not authorized to update this order",
      });
    }

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      orderId: order.id,
      status: order.status,
    });
  } catch (err) {
    next(err);
  }
};
