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

const app = express();

Admin.hasMany(Product);
Product.belongsTo(Admin);

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.hasMany(CartItem);
CartItem.belongsTo(Cart);

CartItem.belongsTo(Product);
Product.hasMany(CartItem);

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use(productRoutes);
app.use(authRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to SizeByte",
  });
});

sequelize
  .sync({ alter: false })
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is Running");
    });
  })
  .catch((err) => {
    console.log(err);
  });
