const router = require("express").Router();
const mongoose = require("mongoose");
const Store = require("../../models/Store");

router.get("/getStores", async (req, res) => {
  try {
    const stores = await Store.find().sort({ _id: -1 });
    return res.json(stores);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/getStores/:adminId", async (req, res) => {
  try {
    const stores = await Store.find({ adminId: req.params.adminId }).sort({ _id: -1 });
    return res.json(stores);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/addStore/:adminId", async (req, res) => {
  try {
    const store = new Store({
      storeName: req.body.shopName,
      address: req.body.shopAddress,
      category: req.body.shopCategory,
      city: req.body.shopCity,
      adminId: mongoose.Types.ObjectId(req.params.adminId),
      cityData: req.body.cityData,
      addressData: req.body.addressData,
    });
    const saved = await store.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.patch("/updateStore/:storeId", async (req, res) => {
  try {
    const { storeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({ error: "Invalid storeId" });
    }

    const updates = {
      storeName: req.body.shopName,
      address: req.body.shopAddress,
      category: req.body.shopCategory,
      city: req.body.shopCity,
      cityData: req.body.cityData,
      addressData: req.body.addressData,
    };

    const updated = await Store.findByIdAndUpdate(
      storeId,
      { $set: updates },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Store not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete("/deleteStore/:storeId", async (req, res) => {
  try {
    const { storeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({ error: "Invalid storeId" });
    }
    const removed = await Store.findByIdAndRemove(storeId);
    if (!removed) return res.status(404).json({ error: "Store not found" });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
