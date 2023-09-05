const { AuthFunction } = require("./auth");
const { invoicesParser } = require("./invoicesParser");
const { newProductParser } = require("./newproductsParser");
const { productParser } = require("./productsParser");
const { salesParser } = require("./salesParser");
const { CheckAuth } = require("./utils");

const cycle = async (page, authData) => {
  try {
    let link = "https://seller.uzum.uz/seller/finances/?filter=ORDERS";
    await page.goto(link);
    try {
      // const timeslotCheck = await timeslotChecker(page, authData);

      const products = await productParser(page, authData);
      // await newProductParser(page, authData);
      // const invoices = await invoicesParser(page, authData);
      // const sales = await salesParser(page, authData);
      // console.log(invoices);
      page.close();
      return true;
    } catch (e) {
      console.log(e);
    }
    return true;
  } catch (e) {
    console.log("Ошибка при парсинге...");
  }
};

module.exports = { cycle };
