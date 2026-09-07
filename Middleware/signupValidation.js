const { body } = require("express-validator");
const Admin = require("../Models/Admin");

const signupValidation = [
  body("name").trim().notEmpty().withMessage("Nameis required"),

  body("email")
    .isEmail()
    .withMessage("Email is required")
    .custom((value) => {
      return Admin.findOne({ where: { email: value } }).then((admin) => {
        if (admin) {
          return Promise.reject("Email already registered ");
        }
      });
    }),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("address").trim().notEmpty().withMessage("Address is required"),
];

module.exports = signupValidation;
