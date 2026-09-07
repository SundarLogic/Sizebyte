const express = require("express");

const productController = require("../Controllers/Product");
const cartController = require("../Controllers/Cart");
const orderController = require("../Controllers/Order");

const isAdminAuth = require("../Middleware/isAdminAuth"); //is admin logged in to create a product
const isAdminAuthorized = require("../Middleware/isAdminAuthorized"); //is this admin allowed to make changes

const isUserAuth = require("../Middleware/isUserAuth");

const productValidation = require("../Middleware/productValidation");

const validate = require("../Middleware/validate");

const fileUpload = require("../Middleware/fileUpload");
const imageValidation = require("../Middleware/imageValidation");

const router = express.Router();

router.post(
  "/products",
  isAdminAuth,
  fileUpload.single("image"),
  imageValidation,
  productValidation,
  validate,
  productController.addProduct,
);

router.get("/products", productController.getProducts);

router.put(
  "/products/:id",
  isAdminAuth,
  isAdminAuthorized,
  fileUpload.single("image"),
  productValidation,
  validate,
  productController.updateProduct,
);

router.delete(
  "/products/:id",
  isAdminAuth,
  isAdminAuthorized,
  productController.deleteProduct,
);

router.post("/cart", isUserAuth, cartController.addCart);

router.get("/cart", isUserAuth, cartController.getCart);

router.put("/cart", isUserAuth, cartController.updateCart);

router.delete("/cart", isUserAuth, cartController.deleteCart);

router.post("/checkout", isUserAuth, orderController.checkout);

router.get("/orders", isUserAuth, orderController.getOrders);

router.get("/admin/orders", isAdminAuth, orderController.getAdminOrders);

router.put("/admin/order/:id", isAdminAuth, orderController.updateOrderStatus);

module.exports = router;
