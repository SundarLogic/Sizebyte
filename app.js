require("dotenv").config();

const helmet = require("helmet");

const express = require("express");

const cors = require("cors");

const productRoutes = require("./Routes/Product");
const authRoutes = require("./Routes/Auth");

const errorHandler = require("./Middleware/errorHandler");

const sequelize = require("./config/database"); //Connecting with the database

const Product = require("./Models/Product");
const Admin = require("./Models/Admin");
const User = require("./Models/User");
const Cart = require("./Models/Cart");
const CartItem = require("./Models/CartItem");
const Order = require("./Models/Order");
const OrderItem = require("./Models/OrderItem");

const app = express();

Admin.hasMany(Product);
Product.belongsTo(Admin);

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.hasMany(CartItem);
CartItem.belongsTo(Cart);

CartItem.belongsTo(Product);
Product.hasMany(CartItem);

Order.hasMany(OrderItem, { as: "orderItems", foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

OrderItem.belongsTo(Product, { foreignKey: "productId" });

app.use(express.json());
app.use(helmet());
//Set CORS_ORIGIN to the frontend URL (comma separated for several)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
  }),
);

app.use(productRoutes);
app.use(authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to SizeByte",
  });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => {
    console.log("Server is Running");
  });
}
module.exports = app;
