const fs = require("fs");

// salesParser();

async function invoicesParser(page, authData) {
  let link = "https://seller.uzum.uz/seller/1814/invoices/send";
  let res = [];
  let counterInvoice = 1;
  let allInvoicesCounter = 0;

  try {
    await page.goto(link);

    await page.waitForSelector("tr.table__body__row");

    try {
      await page.waitForSelector(".tr-hidden");
      await page.locator(".tr-hidden").scroll({
        scrollLeft: 10,
        scrollTop: 20,
      });
    } catch (e) {
      allInvoicesCounter = await page.evaluate(() => {
        return document.querySelectorAll(
          "tbody.tbody-observe tr.table__body__row"
        ).length;
      });
      console.log("CURRENT COUNT INVOICES: " + allInvoicesCounter);

      let lastId;
      while (counterInvoice <= allInvoicesCounter) {
        console.log(counterInvoice);
        await page
          .locator(`.table__body__row:nth-child(${counterInvoice})`)
          .click();
        await page.waitForSelector(".modal-card");

        await page.waitForFunction(
          (title) => {
            console.log(document.querySelector(".header-content span"));
            return (
              title !== document.querySelector(".header-content span").innerText
            );
          },
          {},
          lastId
        );
        lastId = await page.evaluate(
          () => document.querySelector(".header-content span").innerText
        );
        let invoice = await page.evaluate(
          async () => {
            const currentInvoice = {};
            const currentProducts = [];
            lastId = await document.querySelector(".header-content span")
              .innerText;
            currentInvoice.orderInfo = await document.querySelector(
              ".header-content span"
            ).innerText;
            currentInvoice.timeslot = document.querySelector(
              ".timeslot span.timeslot__text"
            ).innerText;
            currentInvoice.status = document.querySelector(
              `span[data-test-id="modal__invoice__status"]`
            ).innerText;
            currentInvoice.allPrice = Number(
              document
                .querySelector(".currency-b2b em")
                .innerText.replaceAll(" ", "")
            );

            const allProducts = await document.querySelectorAll(".subItem");
            await allProducts.forEach(async (product) => {
              const currentData = await product.querySelectorAll(
                "div.data-container"
              );
              if (currentData.length === 4) {
                await currentProducts.push({
                  sku: currentData[0]?.innerText,
                  sentCount: Number(currentData[1]?.innerText),
                  acceptedCount: Number(currentData[2]?.innerText),
                  costPrice: Number(currentData[3]?.innerText.replaceAll(" ", "")),
                });
              } else if (currentData.length === 3) {
                await currentProducts.push({
                  sku: currentData[0]?.innerText,
                  sentCount: Number(currentData[1]?.innerText),
                  costPrice: Number(currentData[2]?.innerText.replaceAll(" ", "")),
                });
              }
            });
            currentInvoice.products = currentProducts;

            return currentInvoice;
          },
          {
            waitUntil: ".modal-card",
          }
        );
        console.log(invoice);
        res.push(invoice);
        await page.locator(".modal-card__close-icon").click();
        await page.waitForFunction(() => {
          return !document.querySelector(".modal");
        }, {});
        counterInvoice++;
      }

      fs.writeFile(
        `invoices/invoices-+${authData.phoneNumber}.json`,
        JSON.stringify({ data: res }),
        (err) => {
          if (err) console.log(err);
        }
      );
      console.log("FINISH");
      return res;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
}

module.exports = { invoicesParser };
