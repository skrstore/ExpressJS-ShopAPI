const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const checkAuth = require("../middlewares/check-auth");

const Order = require("../models/order");
const Product = require("../models/product");

// send all the Orders
router.get("/", (req, res, next) => {
  Order.find()
    .select("product quantity _id")
    .populate("product", "price")
    .then(docs => {
      console.log(docs.length);
      res.json({
        count: docs.length,
        orders: docs.map(doc => {
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: "GET",
              url: "http://localhost:3000/orders/" + doc._id
            }
          };
        })
      });
    })
    .catch(err => {
      console.log("Error : ", err.name);
      res.status(500).json({
        error: err
      });
    });
});

// add a new Order
router.post("/", checkAuth, (req, res, next) => {
  Product.findById(req.body.productId)
    .then(product => {
      console.log(product);
      if (!product) {
        throw new Error("Not Found");
        // return res.status(500).json({
        //   message: "Product Not Found"
        // });
      }
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId
      });

      return order.save();
    })
    .then(result => {
      res.status(201).json({
        message: "Order Stored",
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/" + result._id
        }
      });
    })
    .catch(err => {
      console.log("Error : ", err.name);
      res.status(500).json({
        message: "Product Not Found",
        error: err
      });
    });
});

// send a order
router.get("/:orderId", (req, res, next) => {
  Order.findById(req.params.orderId)
    .select("quantity product _id")
    .populate("product")
    .then(order => {
      if (!order) {
        return res.status(404).json({
          message: "Order Not Found"
        });
      }
      res.status(200).json({
        order: order,
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/"
        }
      });
    })
    .catch(err => {
      console.log("Error : ", err.name);
      res.status(500).json({
        error: err
      });
    });
});

// delete a order
router.delete("/:orderId", checkAuth, (req, res, next) => {
  Order.deleteOne({ _id: req.params.orderId })
    .then(result => {
      res.json({
        message: "Order Deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/orders",
          body: { productId: "ID", quantity: "Number" }
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
