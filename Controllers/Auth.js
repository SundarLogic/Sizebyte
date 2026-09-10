const sequelize = require("../config/database");

const Admin = require("../Models/Admin");
const User = require("../Models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.adminSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const address = req.body.address;

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      return Admin.create({
        name: name,
        email: email,
        password: hashedPassword,
        address: address,
      });
    })
    .then((admin) => {
      res.status(201).json({
        message: "Signup Successful",
        admin: admin,
      });
    })
    .catch((err) => {
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
          message: "Email is invalid",
        });
      }

      return bcrypt.compare(password, admin.password).then((doMatch) => {
        if (!doMatch) {
          return res.status(401).json({
            message: "Password is incorrect",
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
  const address = req.body.address;

  bcrypt
    .hash(password, 12)
    .then((hashedpassword) => {
      return User.create({
        name: name,
        email: email,
        password: hashedpassword,
        address: address,
      });
    })
    .then((user) => {
      res.status(201).json({
        message: "User Signup Successful",
      });
    })
    .catch((err) => {
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
      console.log("User Found:", user);
      if (!user) {
        return res.status(401).json({
          message: "Invalid Username",
        });
      }
      return bcrypt.compare(password, user.password).then((doMatch) => {
        if (!doMatch) {
          return res.status(401).json({
            message: "Wrong Password",
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
