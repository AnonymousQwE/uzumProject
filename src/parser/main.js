const puppeteer = require("puppeteer");
const { spawn, spawnSync } = require("child_process");
const axios = require("axios");
const { cycle } = require("./cycle");
const { CheckAuth } = require("./utils");
const { setUserDataForBrowser } = require("./setUserData");
const { AuthFunction } = require("./auth");

// const authData = {
//   phoneNumber: "+998908221221",
//   password: "Alex@8168620",
// };

const phoneNumber = process.argv[2];
let auth = true;

async function start() {
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
        console.log(
          `Ошибка получения пользователя с сервера по номеру ${phoneNumber} `
        );
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

      page.setViewport({ width: 1366, height: 768 });
      try {
        process.send({
          type: "message",
          text: "Запускаем проверку авторизации",
        });

        page = await setUserDataForBrowser(page, authData);
        // auth = await CheckAuth(page, process);
        process.send({
          type: "message",
          text: `Вы авторизованны под пользователем ${phoneNumber}`,
        });
      } catch (e) {
        process.send({
          type: "message",
          text: "Проблемы с авторизацией... Начинаем процесс авторизации...",
        });

        await AuthFunction(page, authData);
      }

      page.on("close", () => {
        process.send({ type: "exit", text: "Процесс закрылся" });
        process.exit(1);
      });

      if (auth) {
        process.on("message", async (message) => {
          console.log(message);
          process.send(message);
          if (message == "products") {
            process.send({
              type: "message",
              text: "Начинается процесс сбора данных",
            });
            try {
              const newPage = browser.newPage();
              const s = await cycle(newPage, authData);
              process.send({ type: "message", text: "Прошел процесс сбора" });
              process.send(s);
            } catch (e) {
              console.log(e);
              process.send(e);
            }
          }
        });
      } else {
      }
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
