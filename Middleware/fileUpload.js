const multer = require("multer");

const filestorage = multer.diskStorage({
  //destination of the file
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); //how the file should be stored
  },
});

const upload = multer({
  storage: filestorage,

  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

module.exports = upload;
