const Product = require("../Models/Product");

module.exports = (req, res, next) => {
  Product.findOne({
    where: {
      id: req.params.id,
      adminId: req.adminId,
    },
  })
    .then((product) => {
      if (!product) {
        return res.status(403).json({
          message: "Not authorized",
        });
      }
      next();
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong",
      });
    });
};
