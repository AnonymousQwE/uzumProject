const fs = require("fs");
const puppeteer = require("puppeteer");
const { setUserDataForBrowser } = require("./setUserData");
const { default: axios } = require("axios");

// productParser();

async function newProductParser(page, authData) {
  let link = "https://seller.uzum.uz/seller/";
  let link2 = "/products/all";
  let flag = true;
  let res = [];
  let allShopsRes = [];
  let counterPage = 1;
  let shopCounter = 1;
  const allShops = JSON.parse(
    JSON.parse(
      fs.readFileSync(
        `localStorage/localStorage-${authData.phoneNumber}.json`,
        "utf8"
      )
    ).state
  ).shop.shops;

  try {
    await page.goto(`${link + allShops[shopCounter - 1].id}/products/all`);

    await page.waitForSelector(".products-wrapper");

    let totalPageCount = await page.evaluate(async () => {
      try {
        return document.querySelectorAll(".top-bar-container .paginator .page")
          .length;
      } catch (e) {
        console.log(e);
      }
    });

    while (flag) {
      console.log("currentPage=" + counterPage);

      if (shopCounter > 1 && counterPage == 1) {
        console.log(
          "currentShop=" +
            allShops[shopCounter - 1].shopTitle +
            " || " +
            allShops[shopCounter - 1].id
        );
        await page.goto(`${link + allShops[shopCounter - 1].id}/products/all`);

        await page.waitForSelector("div.products-wrapper");

        totalPageCount = await page.evaluate(
          async () =>
            document.querySelectorAll(".top-bar-container .paginator .page")
              .length
        );
      }
      if (counterPage > 1) {
        await page
          .locator(`ul.paginator > li.page:nth-child(${counterPage + 1})`)
          .click();
      }

      await page.waitForSelector("div.products-wrapper");

      if (shopCounter > 1) {
        await page.waitForFunction(
          (title) => {
            return (
              title !==
              document
                .querySelectorAll("div.product-card")[0]
                .querySelector("div.top > div.body > div.product-title")
                .innerText
            );
          },
          {},
          firstTitle
        );
      }

      let currentProductCardsCount = await page.evaluate(
        () => document.querySelectorAll("div.product-card").length
      );

      let productCardCount = 1;

      while (productCardCount != currentProductCardsCount) {
        await page.locator(`div.product-card(${productCardCount})`).click();
        await page.waitForSelector(".modal-card");
        let product = await page.evaluate(async () => {
          const prod = {};
          prod.title = document.querySelector(
            `[data-test-id="link__product-card"]`
          );
          return prod;
        });
        await console.log(product);
        productCardCount++;
      }

      // let html = await page.evaluate(
      //   async () => {
      //     let page = [];

      //     try {
      //       let productCards = document.querySelectorAll("div.product-card");

      //       await forEachRows(productCards, page);

      //       function forEachRows(cards, page) {
      //         cards.forEach(async (product) => {
      //           const prod = {};
      //           prod.link = await product.querySelector("a.link-component")
      //             .href;
      //           prod.saled = Number(
      //             await product.querySelector(
      //               "div.top > div.header > div.right > div.stat-items > div.stat-item:nth-child(4) > span.value"
      //             ).innerText
      //           );
      //           prod.returnCount = Number(
      //             await product
      //               .querySelectorAll("div.stat-items div.stat-item")[5]
      //               .innerText.split("\n")[1]
      //               .split(" ")[0]
      //           );
      //           const statusString = await product.querySelector(
      //             "div.status__item"
      //           ).title;
      //           prod.statusSKU = await statusString.split("\n")[0];
      //           prod.statusCard = await statusString.split("\n")[1];
      //           prod.status = await product.querySelector("span.status__text")
      //             .innerText;
      //           prod.title = await product.querySelector(
      //             "div.top > div.body > div.product-title"
      //           ).title;
      //           const ratingString = await product.querySelectorAll(
      //             "div.stat-items div.stat-item"
      //           )[0].innerText;
      //           prod.rating = Number(await ratingString.split("\n")[1]);
      //           const skuData = await product.querySelector(
      //             "div.top > div.body > div.sku-info"
      //           ).children;
      //           prod.sku = await product.querySelector(
      //             "div.top > div.body > div.sku-info > div.sku > span"
      //           ).innerText;
      //           prod.id = Number(
      //             await skuData.item(1).querySelector("span").innerText
      //           );
      //           await page.push(prod);
      //         });
      //       }
      //     } catch (e) {
      //       console.log(e);
      //     }
      //     return page;
      //   },
      //   {
      //     waitUntil: ".products-wrapper",
      //   }
      // );
      // res = [...res, ...html];

      // console.log("Current Length products=" + res.length);
      // console.log(
      //   "Current Page=" + counterPage,
      //   "Total Page=" + totalPageCount
      // );

      // if (shopCounter == allShops.length && counterPage == totalPageCount) {
      //   flag = false;
      //   // return res;
      // }

      // firstTitle = res[0]?.title || null;
      // if (counterPage < totalPageCount) {
      //   counterPage++;
      // } else if (counterPage == totalPageCount) {
      //   fs.writeFile(
      //     `products/products-${allShops[shopCounter - 1].id}.json`,
      //     JSON.stringify({ data: res }),
      //     (err) => {
      //       if (err) console.log(err);
      //     }
      //   );

      //   await res.forEach(async (p) => {
      //     await axios.post("http://localhost:3000/api/products", { ...p });
      //   });

      //   allShopsRes[allShops[shopCounter - 1].id] = res;
      //   console.log("Products saved. Total:" + res.length + " products");
      //   counterPage = 1;
      //   res = [];

      //   shopCounter++;
      // }
    }
    // return allShopsRes;
  } catch (e) {
    console.log(e);
    return false;
  }
}

module.exports = { newProductParser };
