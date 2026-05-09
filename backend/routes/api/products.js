const router = require("express").Router();
const Product = require("../../models/Product");
const Mongoose = require("mongoose");

router.get("/getItems", (req, res) => {
  Product.find().then((result) => res.send(result));
});

router.post("/addItems/:adminId", async (req, res) => {
  try {
    const { productName, productQuantity, productCategory, productPrice, storeId } = req.body;

    if (!storeId || !Mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({ error: "Valid storeId is required" });
    }

    const product = new Product({
      productName,
      quantity: Number(productQuantity),
      category: productCategory,
      price: Number(productPrice),
      adminId: Mongoose.Types.ObjectId(req.params.adminId),
      storeId: Mongoose.Types.ObjectId(storeId),
    });

    const saved = await product.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.get("/getStoreItem/:adminId", async (req, res) => {
  const { storeId } = req.query;
  const filter = { adminId: req.params.adminId };
  if (storeId && Mongoose.Types.ObjectId.isValid(storeId)) {
    filter.storeId = storeId;
  }
  Product.find(filter).then((response) => res.send(response));
});

router.get("/getProductsByStore/:storeId", async (req, res) => {
  Product.find({ storeId: req.params.storeId }).then((response) => {
    res.send(response);
  });
});

router.delete("/deleteItem/:productId", async (req, res) => {
  const product = await Product.findByIdAndRemove(req.params.productId);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.send("Success");
});

router.patch("/updateItem/:productId", (req, res) => {
  Product.findByIdAndUpdate(
    { _id: req.params.productId },
    {
      $set: {
        quantity: req.body.productQuantity,
        category: req.body.productCategory,
        price: req.body.productPrice,
      },
    }
  ).then(() => res.status(200).send("Success"));
});

module.exports = router;
