module.exports = (req, res, next) => {
  if (!req.file) {
    return res.status(422).json({
      message: "Image is required",
    });
  }
  next();
};
