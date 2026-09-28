const { body } = require("express-validator");

const User = require("../Models/User");

const UserSignupValidation = [
  body("name").trim().notEmpty().withMessage("Name is Required"),

  body("email")
    .isEmail()
    .withMessage("Email is required")
    .custom((value) => {
      return User.findOne({
        where: {
          email: value,
        },
      }).then((user) => {
        if (user) {
          return Promise.reject("Email is already registered");
        }
      });
    }),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 characters long"),
];

module.exports = UserSignupValidation;
