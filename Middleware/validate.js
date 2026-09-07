//Store the validationResult
const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "validation failed",
      errors: errors.array(),
    });
  }

  next();
};
