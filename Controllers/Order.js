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
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          attributes: ["id", "productId", "quantity", "price"],
          include: [
            {
              model: Product,
              attributes: ["id", "name", "imageUrl"],
              paranoid: false, //keep showing products the seller has since deleted
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      message: orders.length ? "Orders found" : "No orders found for this user",
      orders: orders,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAdminOrders = async (req, res, next) => {
  const adminId = req.adminId;

  try {
    const orderItems = await OrderItem.findAll({
      attributes: ["id", "orderId", "productId", "quantity", "price"],
      include: [
        {
          model: Product,
          where: {
            adminId: adminId,
          },
          attributes: ["id", "name", "imageUrl"],
          paranoid: false,
        },
        {
          model: Order,
          attributes: ["id", "userId", "totalAmount", "status"],
        },
      ],
      order: [["orderId", "DESC"]],
    });

    const adminOrders = orderItems.map((orderItem) => ({
      orderId: orderItem.order.id,
      userId: orderItem.order.userId,
      totalAmount: orderItem.order.totalAmount,
      status: orderItem.order.status,
      product: {
        id: orderItem.product.id,
        name: orderItem.product.name,
        imageUrl: orderItem.product.imageUrl,
      },
      quantity: orderItem.quantity,
      price: orderItem.price,
    }));

    return res.status(200).json({
      message: adminOrders.length
        ? "Orders found for this admin's products"
        : "No orders found for this admin's products",
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

  let transaction;

  try {
    const allowedStatuses = ["ORDERED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    //The admin may update the order only if it contains one of their products
    const adminOrderItem = await OrderItem.findOne({
      where: {
        orderId: orderId,
      },
      include: [
        {
          model: Product,
          where: {
            adminId: adminId,
          },
          attributes: [],
          paranoid: false,
        },
      ],
    });
    if (!adminOrderItem) {
      return res.status(403).json({
        message: "You are not authorized to update this order",
      });
    }

    transaction = await sequelize.transaction();

    const order = await Order.findByPk(orderId, {
      transaction: transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Order not found",
      });
    }

    //Stock is returned on cancel, so a cancelled order cannot be reopened
    if (order.status === "CANCELLED") {
      await transaction.rollback();

      return res.status(400).json({
        message: "Cancelled orders cannot be updated",
      });
    }

    if (status === "CANCELLED") {
      const orderItems = await OrderItem.findAll({
        where: {
          orderId: order.id,
        },
        transaction: transaction,
      });

      for (const item of orderItems) {
        const product = await Product.findByPk(item.productId, {
          transaction: transaction,
          lock: transaction.LOCK.UPDATE,
          paranoid: false,
        });
        if (product) {
          product.quantity = product.quantity + item.quantity;

          await product.save({
            transaction: transaction,
          });
        }
      }
    }

    order.status = status;
    await order.save({
      transaction: transaction,
    });

    await transaction.commit();

    return res.status(200).json({
      message: "Order status updated successfully",
      orderId: order.id,
      status: order.status,
    });
  } catch (err) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    next(err);
  }
};
