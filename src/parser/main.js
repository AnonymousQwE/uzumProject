const puppeteer = require("puppeteer");
const axios = require("axios");
const { cycle } = require("./cycle");
const { checkAuth, timeslotToDate } = require("./utils");
const { setUserDataForBrowser } = require("./setUserData");
const { AuthFunction } = require("./auth");

// const authData = {
//   phoneNumber: "+998908221221",
//   password: "Alex@8168620",
// };

const messages = {};

const phoneNumber = process.argv[2];
let auth = true;

async function start() {
  const parserPages = {};
  try {
    const user = await axios
      .get(`http://localhost:3000/api/users/findByPhone/${phoneNumber}`)
      .then((res) => res.data)
      .catch(function (error) {
        if (error.response) {
          console.log(error.response.status);
        } else {
          console.log("Error", error.message);
        }
      });

    if (user?._id) {
      const authData = {
        id: user?._id,
        phoneNumber: user?.phoneNumber,
        password: user?.password,
        cookies: user?.cookies,
        localStorage: user?.localStorage,
      };

      const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        // slowMo: 50,
        // devtools: true,
      });
      let pages = await browser.pages();

      let page = pages[0];
      page.on("close", () => {
        process.send({ type: "exit", text: "Процесс закрылся" });
        process.exit(1);
      });
      page.setDefaultTimeout(100000);
      page.setViewport({ width: 1366, height: 768 });
      try {
        process.send({
          type: "auth",
          first: true,
          text: "Проверяем авторизацию 💤",
          status: "work"
        });

        page = await setUserDataForBrowser(page, authData);
        auth = await checkAuth(page, process);
        process.send({
          type: "auth",
          status: auth,
          text: `*Статус авторизации:* ${checkAuth ? "✅" : "⛔️"}`,
        });
      } catch (e) {
        process.send({
          type: "auth",
          text: "Проблемы с авторизацией...\nНачинаем процесс авторизации...",
        });

        await AuthFunction(page, authData);
        await checkAuth(page, process);
      }



      process.on("message", async (message) => {
        if (auth) {
          if (message.type == "products") {
            process.send({
              type: "productMessage",
              text: "Начинается процесс сбора данных",
              shopId: "all",
              first: true,
              status: "work",
            });
            try {
              if (parserPages.productsParse instanceof puppeteer.Page) {
                process.send({
                  type: "productMessage",
                  text: "Парсинг товаров запущен",
                  shopId: "all",
                  status: "work"
                });
              } else {
                parserPages.productsParse = await browser.newPage();
              }
              await cycle(parserPages.productsParse, authData, "products");

              if (cycle) {
                console.log(cycle)
                process.send({
                  type: "productMessage",
                  text: "*Процесс сбора товаров завершен успешно ✅*",
                  first: true,
                  status: true
                });
              }
            } catch (e) {
              console.log(e);
              process.send(e);
            }
          }

          if (message.type == "timeslotUpdater") {
            process.send({
              type: "timeslotMessage",
              text: "Начинается процесс сбора данных",
              shopId: "all",
              first: true,
              status: "work",
            });
            try {
              if (parserPages.timeslotUpdater instanceof puppeteer.Page) {
                process.send({
                  type: "timeslotMessage",
                  text: "Ловля таймслота в процессе...",
                  shopId: "all",
                  status: "work"
                });
              } else {
                parserPages.timeslotUpdater = await browser.newPage();
              }
              const timeslotUpdaterPage = await cycle(parserPages.timeslotUpdater, authData, "timeslotUpdater");
              if (timeslotUpdaterPage) {
              }
            } catch (e) {
              console.log(e);
              process.send(e);
            }
          }
          if (message.type == "goTimeslotCheck" && parserPages.timeslotUpdater instanceof puppeteer.Page) {
            const timeslot = await parserPages.timeslotUpdater.evaluate((count) => {
              const rows = document.querySelectorAll(".table__body__row")
              const currentRow = rows[count]
              const timeslot = currentRow.querySelector('[data-test-id="text__timeslot-reservation"]').innerText
              currentRow.querySelectorAll("td")[1].click()
              return timeslot
            }, message.count)
            process.send({
              type: "log",
              timeslot
            })
            // const currentTimeslot = await timeslotToDate("t", timeslot)
            // process.send({
            //   type: "log",
            //   message: "okay",
            //   currentTimeslot
            // })
          }
        }
      });
    } else {
      process.send({
        type: "user",
        text: `Пользователь с номером *${phoneNumber}* не найден...`,
      });
    }

  } catch (e) {
    console.log("Ошибка при запуске парсера...");
    process.send(e);
    process.send("Ошибочка...");
    console.log(e.message);
    return e;
  }
}

start();
