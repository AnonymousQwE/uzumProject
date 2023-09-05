const fs = require("fs");
const { timeslotToDate } = require("./utils");

// salesParser();

async function timeslotChecker(page, authData) {
  let link = "https://seller.uzum.uz/seller/1814/invoices/send";

  try {
    await page.goto(link);

    await page.waitForSelector("tr.table__body__row");
    await page.waitForSelector(".td-hidden");
    const word = "Создана";
    try {
      const timeslot = await page.evaluate(
        () =>
          document.querySelector(`[data-test-id="text__timeslot-reservation"]`)
            .innerText
      );

      const currentDate = timeslotToDate("t", timeslot);

      await page.locator(".table__body__row").click();
      await page.waitForSelector(".modal-card");

      await page.locator(".timeslot__button").click();

      await page.waitForSelector(".side-modal");
      const newTimeSlotDate = await page.evaluate(
        () => document.querySelector(`.timeslots__date`).innerText
      );

      const currentNewTimeSlot = timeslotToDate("nt", newTimeSlotDate);

      if (currentNewTimeSlot > currentDate) {
        console.log("New Timeslot >");
      } else if (currentDate > currentNewTimeSlot) {
        console.log("new TimeSlot <");

        await page.locator(`.timeslot`).click();

        await page.waitForSelector(".timeslots__footer__text");

        // await page.waitForFunction(
        //   (selector) => {
        //     console.log("WAIT");
        //     return !document.querySelector(selector);
        //   },
        //   {},
        //   `.disabled__overlay`
        // );

        await page.locator(`[data-test-id="button__save"]`).click();
        console.log(`newTimeSlot: ${currentNewTimeSlot.toLocaleDateString()}`);
      } else {
        console.log("ERROR");
        console.log(`newTimeslot ${currentNewTimeSlot}`);
        console.log(`oldTimeslot ${currentDate}`);
      }
      // let invoice = await page.evaluate(
      //   async () => {
      //     const currentInvoice = {};
      //     const currentProducts = [];
      //     lastId = await document.querySelector(".header-content span")
      //       .innerText;
      //     currentInvoice.orderInfo = await document.querySelector(
      //       ".header-content span"
      //     ).innerText;
      //     currentInvoice.timeslot = document.querySelector(
      //       ".timeslot span.timeslot__text"
      //     ).innerText;
      //     currentInvoice.status = document.querySelector(
      //       `span[data-test-id="modal__invoice__status"]`
      //     ).innerText;
      //     currentInvoice.allPrice =
      //       document.querySelector(".currency-b2b em").innerText;
      //     const allProducts = await document.querySelectorAll(".subItem");
      //     await allProducts.forEach(async (product) => {
      //       const currentData = await product.querySelectorAll(
      //         "div.data-container"
      //       );
      //       console.log(currentData);
      //       if (currentData.length === 4) {
      //         await currentProducts.push({
      //           sku: currentData[0]?.innerText,
      //           sentCount: currentData[1]?.innerText,
      //           acceptedCount: currentData[2]?.innerText,
      //           costPrice: currentData[3]?.innerText,
      //         });
      //       } else if (currentData.length === 3) {
      //         await currentProducts.push({
      //           sku: currentData[0]?.innerText,
      //           sentCount: currentData[1]?.innerText,
      //           costPrice: currentData[2]?.innerText,
      //         });
      //       }
      //     });
      //     currentInvoice.products = currentProducts;
      //     return currentInvoice;
      //   },
      //   {
      //     waitUntil: ".modal-card",
      //   }
      // );
    } catch (e) {
      console.log(e);
    }

    //   try {
    //     await page.locator(".td-hidden").scroll({
    //       scrollLeft: 10,
    //       scrollTop: 20,
    //     });
    //   } catch (e) {
    //     allInvoicesCounter = await page.evaluate(() => {
    //       return document.querySelectorAll(
    //         "tbody.tbody-observe tr.table__body__row"
    //       ).length;
    //     });
    //     console.log("CURRENT COUNT INVOICES: " + allInvoicesCounter);

    //     let lastId;
    //     while (counterInvoice <= allInvoicesCounter) {
    //       console.log(counterInvoice);
    //       await page
    //         .locator(`.table__body__row:nth-child(${counterInvoice})`)
    //         .click();
    //       await page.waitForSelector(".modal-card");

    //       await page.waitForFunction(
    //         (title) => {
    //           console.log(document.querySelector(".header-content span"));
    //           return (
    //             title !== document.querySelector(".header-content span").innerText
    //           );
    //         },
    //         {},
    //         lastId
    //       );
    //       lastId = await page.evaluate(
    //         () => document.querySelector(".header-content span").innerText
    //       );
    //       let invoice = await page.evaluate(
    //         async () => {
    //           const currentInvoice = {};
    //           const currentProducts = [];
    //           lastId = await document.querySelector(".header-content span")
    //             .innerText;
    //           currentInvoice.orderInfo = await document.querySelector(
    //             ".header-content span"
    //           ).innerText;
    //           currentInvoice.timeslot = document.querySelector(
    //             ".timeslot span.timeslot__text"
    //           ).innerText;
    //           currentInvoice.status = document.querySelector(
    //             `span[data-test-id="modal__invoice__status"]`
    //           ).innerText;
    //           currentInvoice.allPrice =
    //             document.querySelector(".currency-b2b em").innerText;
    //           const allProducts = await document.querySelectorAll(".subItem");
    //           await allProducts.forEach(async (product) => {
    //             const currentData = await product.querySelectorAll(
    //               "div.data-container"
    //             );
    //             console.log(currentData);
    //             if (currentData.length === 4) {
    //               await currentProducts.push({
    //                 sku: currentData[0]?.innerText,
    //                 sentCount: currentData[1]?.innerText,
    //                 acceptedCount: currentData[2]?.innerText,
    //                 costPrice: currentData[3]?.innerText,
    //               });
    //             } else if (currentData.length === 3) {
    //               await currentProducts.push({
    //                 sku: currentData[0]?.innerText,
    //                 sentCount: currentData[1]?.innerText,
    //                 costPrice: currentData[2]?.innerText,
    //               });
    //             }
    //           });
    //           currentInvoice.products = currentProducts;

    //           return currentInvoice;
    //         },
    //         {
    //           waitUntil: ".modal-card",
    //         }
    //       );
    //       console.log(invoice);
    //       res.push(invoice);
    //       await page.locator(".modal-card__close-icon").click();
    //       await page.waitForFunction(() => {
    //         return !document.querySelector(".modal");
    //       }, {});
    //       counterInvoice++;
    //     }

    //     fs.writeFile(
    //       `invoices/invoices.json`,
    //       JSON.stringify({ data: res }),
    //       (err) => {
    //         if (err) console.log(err);
    //       }
    //     );
    //     console.log("FINISH");
    //     return res;
    //   }
  } catch (e) {
    console.log(e);
    return false;
  }
}

module.exports = { timeslotChecker };
