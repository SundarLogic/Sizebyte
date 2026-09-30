const { body } = require("express-validator");

const signupValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),

  body("email").isEmail().withMessage("Email is required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

module.exports = signupValidation;
