//Storing in cloudinary
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 4 * 1024 * 1024, //Vercel rejects request bodies above 4.5MB
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      const error = new Error("Only JPEG and PNG images are allowed");
      error.status = 422;
      cb(error);
    }
  },
});

module.exports = upload;
