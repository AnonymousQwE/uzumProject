const puppeteer = require("puppeteer");
const { spawn, spawnSync } = require("child_process");
const axios = require("axios");
const { cycle } = require("./cycle");
const { checkAuth } = require("./utils");
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
        process.send({
          type: "error",
          text: `Ошибка получения пользователя с сервера по номеру ${phoneNumber} `,
        });
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
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        // slowMo: 50,
        // devtools: true,
      });
      let pages = await browser.pages();

      let page = pages[0];
      page.setDefaultTimeout(100000);
      page.setViewport({ width: 1920, height: 1080 });
      try {
        process.send({
          type: "auth",
          first: true,
          text: "Запускаем проверку авторизации 💤",
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

      page.on("close", () => {
        process.send({ type: "exit", text: "Процесс закрылся" });
        process.exit(1);
      });

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
                });
              } else {
                parserPages.productsParse = await browser.newPage();
              }
              await cycle(parserPages.productsParse, authData, process);

              if (cycle) {
                process.send({
                  type: "productMessage",
                  text: "*Процесс сбора товаров завершен\\!*",
                  first: true,
                });
              }
            } catch (e) {
              console.log(e);
              process.send(e);
            }
          }
        } else {
        }
      });
    }

    process.on("exit", async () => {
      console.log("Процесс завершается. Закрываем браузер...");
      await browser.close();
    });
  } catch (e) {
    console.log("Ошибка при запуске парсера...");
    process.send(e);
    process.send("Ошибочка...");
    console.log(e.message);
    return e;
  }
}

start();
