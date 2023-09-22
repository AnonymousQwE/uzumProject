const { AuthFunction } = require("./auth");
const { invoicesParser } = require("./invoicesParser");
const { newProductParser } = require("./newproductsParser");
const { productParser } = require("./productsParser");
const { salesParser } = require("./salesParser");
const { timeslotChecker } = require("./timeslotChecker");
const { CheckAuth } = require("./utils");

const cycle = async (page, authData, type) => {
  const allShops = JSON.parse(JSON.parse(authData.localStorage).state).shop
    .shops;
  try {
    let link = "https://seller.uzum.uz/seller/finances/?filter=ORDERS";
    await page.goto(link);
    try {
      if (type === 'timeslotUpdater') { const timeslotsPage = await timeslotChecker(page, authData); }
      if (type === 'products') { const products = await productParser(page, authData, process); }
      // await newProductParser(page, authData);
      // const invoices = await invoicesParser(page, authData);
      // const sales = await salesParser(page, authData);
      // console.log(invoices);
      // page.close();

      // if (products) {
      //   return true;
      // }
      return timeslotsPage
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
