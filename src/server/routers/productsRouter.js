var express = require("express");
const ProductModel = require("../models/ProductModel");
var productsRouter = express.Router();
const jsonParser = express.json();

// middleware that is specific to this router
// productsRouter.use(function timeLog(req, res, next) {
//   console.log("Time: ", Date.now());
//   next();
// });

productsRouter.get("/", async (req, res) => {
  // получаем всех пользователей
  const products = await ProductModel.find({});
  res.send(products);
});

productsRouter.post("/", jsonParser, async (req, res) => {
  try {
    if (!req.body) return res.sendStatus(400);

    const title = req.body.title;
    const link = req.body.link;
    const saledCount = req.body.saledCount;
    const returnCount = req.body.returnCount;
    const statusSKU = req.body.statusSKU;
    const statusCard = req.body.statusCard;
    const status = req.body.status;
    const rating = req.body.rating;
    const sku = req.body.sku;
    const productId = req.body.productId;

    const currentProd = ProductModel.findOne({ sku });

    if (currentProd.sku) {
      return res.sendStatus(200);
      console.log(currentProd);
    } else {
      const product = new ProductModel({
        title,
        link,
        saledCount,
        returnCount,
        statusSKU,
        statusCard,
        status,
        rating,
        sku,
        productId,
      });
      // сохраняем в бд
      await product.save();
      res.status(200).send(product);
    }
  } catch (error) {
    // console.log(error);
    console.log("Ошибка в парсере продуктов");
  }
});

module.exports = productsRouter;
