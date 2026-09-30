const sequelize = require("../config/database");

const Admin = require("../Models/Admin");
const User = require("../Models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//The unique index on email rejects duplicates, so reply like validate.js does
const duplicateEmailResponse = (res, email, msg) => {
  return res.status(422).json({
    message: "validation failed",
    errors: [
      {
        type: "field",
        value: email,
        msg: msg,
        path: "email",
        location: "body",
      },
    ],
  });
};

exports.adminSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  bcrypt
    .hash(password, 10)
    .then((hashedPassword) => {
      return Admin.create({
        name: name,
        email: email,
        password: hashedPassword,
      });
    })
    .then((admin) => {
      res.status(201).json({
        message: "Signup Successful",
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        },
      });
    })
    .catch((err) => {
      if (err.name === "SequelizeUniqueConstraintError") {
        return duplicateEmailResponse(res, email, "Email already registered");
      }
      next(err);
    });
};

exports.adminLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  Admin.findOne({
    where: {
      email: email,
    },
  })
    .then((admin) => {
      if (!admin) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      return bcrypt.compare(password, admin.password).then((doMatch) => {
        if (!doMatch) {
          return res.status(401).json({
            message: "Invalid email or password",
          });
        }

        const token = jwt.sign(
          {
            adminId: admin.id,
            email: admin.email,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          },
        );
        res.status(200).json({
          message: "Login Successful",
          adminId: admin.id,
          token: token,
        });
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.userSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  bcrypt
    .hash(password, 10)
    .then((hashedpassword) => {
      return User.create({
        name: name,
        email: email,
        password: hashedpassword,
      });
    })
    .then((user) => {
      res.status(201).json({
        message: "User Signup Successful",
      });
    })
    .catch((err) => {
      if (err.name === "SequelizeUniqueConstraintError") {
        return duplicateEmailResponse(
          res,
          email,
          "Email is already registered",
        );
      }
      next(err);
    });
};

exports.userLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({
    where: {
      email: email,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }
      return bcrypt.compare(password, user.password).then((doMatch) => {
        if (!doMatch) {
          return res.status(401).json({
            message: "Invalid email or password",
          });
        }

        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          },
        );

        res.status(200).json({
          message: "Login Successful",
          userId: user.id,
          token: token,
        });
      });
    })
    .catch((err) => {
      next(err);
    });
};
