const { body } = require("express-validator");

const UserSignupValidation = [
  body("name").trim().notEmpty().withMessage("Name is Required"),

  body("email").isEmail().withMessage("Email is required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 characters long"),
];

module.exports = UserSignupValidation;
