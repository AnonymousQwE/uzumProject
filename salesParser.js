const fs = require("fs");
const puppeteer = require("puppeteer");
const { setUserDataForBrowser } = require("./setUserData");

// salesParser();

async function salesParser(page, authData) {
  let link = "https://seller.uzum.uz/seller/finances/?filter=ORDERS";
  let flag = true;
  let res = [];
  let counterPage = 1;

  try {
    await page.goto(link);

    await page.waitForSelector("tr.table__body__row");

    let totalPageCount = await page.evaluate(async () => {
      try {
        return document
          .querySelector("li.page.disabled ~ .page")
          .querySelector("a").innerText;
      } catch (e) {
        console.log(e);
      }
    });

    while (flag) {
      let firstOrderId = await page.evaluate(
        async () =>
          document
            .querySelectorAll("tr.table__body__row")[0]
            .querySelector("td:nth-child(4)").innerText
      );

      if (counterPage > 1) {
        await page.locator(`li.page.active ~ li.page`).click();
        await page.waitForFunction(
          (firstOrderId) => {
            return (
              firstOrderId !==
              document
                .querySelectorAll("tr.table__body__row")[0]
                .querySelector("td:nth-child(4)").innerText
            );
          },
          {},
          firstOrderId
        );
      }

      let html = await page.evaluate(
        async () => {
          let allData = [];

          try {
            let sales = document.querySelectorAll(
              "tbody.tbody-observe tr.table__body__row"
            );

            await forEachSales(sales, allData);

            function forEachSales(sales, allData) {
              sales.forEach(async (sale) => {
                const currentSale = {};
                currentSale.id = Number(
                  await sale
                    .querySelectorAll("td")[3]
                    .querySelector("div.data-container").innerText
                );
                currentSale.createDate = await sale
                  .querySelectorAll("td")[1]
                  .querySelector("div.data-container").innerText;
                currentSale.status = await sale
                  .querySelectorAll("td")[0]
                  .querySelector("span.print-only")
                  .innerText.split(",")[0];
                currentSale.skuTitle = await sale
                  .querySelectorAll("td")[4]
                  .querySelector("div.data-container").innerText;
                currentSale.amount = Number(
                  await sale
                    .querySelectorAll("td")[6]
                    .querySelector("div.data-container").innerText
                );
                currentSale.sellPrice = Number(
                  await sale
                    .querySelectorAll("td")[7]
                    .querySelector("div.data-container")
                    .innerText.replace(/\s/g, "")
                );
                currentSale.purchasePrice = Number(
                  await sale
                    .querySelectorAll("td")[8]
                    .querySelector("div.data-container")
                    .innerText.replace(/\s/g, "")
                );

                currentSale.sellerProfit = Number(
                  await sale
                    .querySelectorAll("td")[8]
                    .querySelector("div.data-container")
                    .innerText.replace(/\s/g, "")
                );
                currentSale.commission = Number(
                  await sale
                    .querySelectorAll("td")[9]
                    .querySelector("div.data-container")
                    .innerText.replace(/\s/g, "")
                );
                await allData.push(currentSale);
              });
            }
          } catch (e) {
            console.log(e);
          }
          return allData;
        },
        {
          waitUntil: "tr.table__body__row",
        }
      );
      res = [...res, ...html];

      console.log(
        "Saved Sales Page=" + counterPage,
        "Total Sales Page=" + totalPageCount
      );

      if (counterPage == totalPageCount) {
        flag = false;

        fs.writeFile(
          `sales/sales-${authData.phoneNumber}.json`,
          JSON.stringify({ data: res }),
          (err) => {
            if (err) console.log(err);
          }
        );
        console.log("Sales saved. Total:" + res.length + " sale");
        page.close();
      }

      if (counterPage < totalPageCount) {
        counterPage++;
      }
    }
    console.log("FINISH");
    return res;
  } catch (e) {
    console.log(e);
    return false;
  }
}

module.exports = { salesParser };
