const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const checkAuth = require("../middlewares/check-auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 4
  },
  // only accept jpeg and png images
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});
// const upload = multer({ dest: "./uploads/" });

const Product = require("../models/product");

// to send all the product
router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id productImage")
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/" + doc._id
            }
          };
        })
      };
      console.log(response.count);
      //   if (docs.length > 0) {
      res.status(200).json(response);
      //   } else {
      //     res.status(404).json({
      //       message: "No Entries Found"
      //     });
      //   }
    })
    .catch(err => {
      console.log("Error: ", err.name);
      res.status(500).json({
        error: err
      });
    });
});

// to add a new Product
router.post("/", checkAuth, upload.single("productImage"), (req, res, next) => {
  console.log(req.file);

  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });
  product
    .save()
    .then(result => {
      console.log("RESULT : ", result);
      res.status(201).json({
        message: "POST Method Request",
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/products/" + result._id
          }
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

// to send a product
router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  console.log(id);
  Product.findById(id)
    .select("price name _id productImage")
    .then(doc => {
      console.log("DOC : ", doc);
      if (doc) {
        res.status(200).json({
          product: doc,
          request: {
            type: "GET",
            description: "GET all products",
            url: "http://loclhost:3000/products"
          }
        });
      } else {
        res.status(404).json({ message: "Not Data Found for the ID" });
      }
    })
    .catch(err => {
      console.log("Erorr : ", err.name);
      res.status(500).json({
        error: err
      });
    });
});

// to update a product
router.patch("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  console.log(updateOps);

  Product.updateOne(
    { _id: id },
    {
      $set: updateOps
      //   {
      //     name: req.body.newName,
      //     price: req.body.newPrice
      //   }
    }
  )
    .then(result => {
      console.log("Result U : ", result);
      res.json({
        message: "Product Updated",
        request: {
          type: "GET",
          url: "http://localhost:3000/products" + id
        }
      });
    })
    .catch(err => {
      console.log("Erorr U : ", err.name);
      res.status(500).json({
        error: err
      });
    });
});

// to delete a product
router.delete("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  Product.remove({ _id: id })
    .then(result => {
      console.log("Result D : ", result);
      res.json({
        message: "Product Deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/products",
          body: { name: "Strig", price: "Number" }
        }
      });
    })
    .catch(err => {
      console.log("Error D :", err.name);
      res.status(500).json({ message: err });
    });
});

module.exports = router;
