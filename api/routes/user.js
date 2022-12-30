const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const checkAuth = require("../middlewares/check-auth");

const User = require("../models/user");

// Create a new User
router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email }).then(user => {
    if (user.length > 0) {
      return res.status(422).json({
        message: "Email Exists"
      });
    } else {
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password: req.body.password
      });

      user
        .save()
        .then(result => {
          console.log("Result : ", result);
          res.status(201).json({
            message: "User Created"
          });
        })
        .catch(err => {
          console.log("Error : ", err.name);
          res.status(500).json({
            error: err
          });
        });
    }
  });
});

// user login
router.post("/login", (req, res, next) => [
  User.find({ email: req.body.email })
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth Failed"
        });
      } else if (req.body.password === user[0].password) {
        const token = jwt.sign(
          {
            email: user[0].email,
            userId: user[0]._id
          },
          "secret",
          {
            expiresIn: "1h"
          }
        );

        return res.json({
          message: "Auth Successful",
          token: token
        });
      }
      return res.status(401).json({
        message: "Auth Failed"
      });
    })
    .catch(err => {
      console.log("Error : ", err.name);
      res.status(500).json({
        error: err
      });
    })
]);

// user delete
router.delete("/:userId", checkAuth, (req, res, next) => {
  User.deleteOne({ _id: req.params.userId })
    .then(result => {
      console.log("Result : ", result);
      res.json({
        message: "User Deleted"
      });
    })
    .catch(err => {
      console.log("Error : ", err.name);
      res.status(500).json({
        errro: err
      });
    });
});

module.exports = router;
