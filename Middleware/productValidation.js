//Setting up of validation rules
const { body } = require("express-validator");

const productValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),

  body("category").trim().notEmpty().withMessage("Category is required"),

  body("description").trim().notEmpty().withMessage("Description is required"),

  body("price")
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a valid positive number"),

  body("quantity")
    .isInt({ min: 0 })
    .withMessage("Quantity should be a whole number of 0 or more"),
];

module.exports = productValidation;
