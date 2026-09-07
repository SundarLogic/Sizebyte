const express = require("express");

const authController = require("../Controllers/Auth");

const signupValidation = require("../Middleware/signupValidation");
const validate = require("../Middleware/validate");

const router = express.Router();

router.post(
  "/admin/signup",
  signupValidation,
  validate,
  authController.adminSignup,
);

router.post("/admin/login", authController.adminLogin);

router.post(
  "/user/signup",
  signupValidation,
  validate,
  authController.userSignup,
);

router.post("/user/login", authController.userLogin);

module.exports = router;
