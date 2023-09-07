const { AuthFunction } = require("./auth");
const { invoicesParser } = require("./invoicesParser");
const { newProductParser } = require("./newproductsParser");
const { productParser } = require("./productsParser");
const { salesParser } = require("./salesParser");
const { CheckAuth } = require("./utils");

const cycle = async (page, authData, process) => {
  const allShops = JSON.parse(JSON.parse(authData.localStorage).state).shop
    .shops;
  try {
    let link = "https://seller.uzum.uz/seller/finances/?filter=ORDERS";
    await page.goto(link);
    try {
      // const timeslotCheck = await timeslotChecker(page, authData);
      process.send({
        type: "auth",
        shopId: "all",
        text: "Идёт процесс сбора товаров",
      });
      const products = await productParser(page, authData, process);
      // await newProductParser(page, authData);
      // const invoices = await invoicesParser(page, authData);
      // const sales = await salesParser(page, authData);
      // console.log(invoices);
      // page.close();
      if (products) {
        return true;
      }
    } catch (e) {
      console.log(e);
      return e;
    }
  } catch (e) {
    console.log(e);
    return e;
    // console.log("Ошибка при парсинге...");
  }
};

module.exports = { cycle };
