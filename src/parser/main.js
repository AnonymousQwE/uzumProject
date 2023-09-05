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
let auth = false;

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
        auth = await CheckAuth(page, process);
        process.send({
          type: "message",
          text: `Вы авторизованны под пользователем ${phoneNumber}`,
        });
      } catch (e) {
        console.log(e);
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
        console.log("Основной парсер запущен успешно");
        process.stdin.on("data", async (data) => {
          if (data == "products") {
            try {
              const newPage = await browser.newPage();
              await cycle(newPage, authData);
              console.log("Цикл запущен");
            } catch (e) {
              console.log(e);
            }
          }
        });
      } else {
      }
    }
  } catch (e) {
    console.log("Ошибка при запуске парсера...");
    console.log(e.message);
    return e;
  }
}

start();
