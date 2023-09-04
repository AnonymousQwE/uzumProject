const { AuthFunction } = require("./auth");
const { invoicesParser } = require("./invoicesParser");
const { newProductParser } = require("./newproductsParser");
const { productParser } = require("./productsParser");
const { salesParser } = require("./salesParser");
const { CheckAuth } = require("./utils");

const cycle = async (page, authData) => {
  try {
    let flag = true;
    let auth = false;

    while (flag) {
      if (auth) {
        let link = "https://seller.uzum.uz/seller/finances/?filter=ORDERS";
        await page.goto(link);
        try {
          // const timeslotCheck = await timeslotChecker(page, authData);

          const products = await productParser(page, authData);
          // await newProductParser(page, authData);
          // const invoices = await invoicesParser(page, authData);
          // const sales = await salesParser(page, authData);
          // console.log(invoices);
          await setTimeout(() => console.log("TimeoutStarted"), 1000000);
          flag = false;
        } catch (e) {
          console.log(e);
          flag = false;
        }
      } else {
        try {
          console.log("CHECK AUTH START");
          auth = await CheckAuth(page, authData);
          console.log("You auth state is " + auth);
        } catch (e) {
          try {
            auth = await AuthFunction(page, authData);
          } catch (error) {
            console.log(error);
            browser.close();
            flag = false;
          }
          console.log(e);
        }
      }
    }
    return true;
  } catch (e) {
    console.log("Ошибка при парсинге...");
  }
};
// cycle(page, authData);

process.on("message", async (data) => {
  try {
    console.log(data);

    // Получаем объект `page` из сообщения
    const page = data.browserContext.newPage();

    // Выполняем операции с `page` в дочернем процессе
    await page.goto("https://example.com");
    // Ваши действия с `page` здесь

    // Отправляем сообщение обратно в родительский процесс (необязательно)
    process.send({ message: "Выполнено" });

    // Закрываем дочерний процесс
    process.exit();
  } catch (e) {
    console.log(e);
  }
});

module.exports = { cycle };
