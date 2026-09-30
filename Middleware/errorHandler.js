const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  console.log(err);

  if (err instanceof multer.MulterError) {
    return res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
      message:
        err.code === "LIMIT_FILE_SIZE" ? "Image must be under 4MB" : err.message,
    });
  }

  //Errors like invalid JSON or a rejected file type carry their own status
  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    message: status < 500 ? err.message : "Something went wrong",
  });
};

module.exports = errorHandler;
