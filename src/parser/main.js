const puppeteer = require("puppeteer");
const { spawn, spawnSync } = require("child_process");
const axios = require("axios");
const { cycle } = require("./cycle");

// const authData = {
//   phoneNumber: "+998908221221",
//   password: "Alex@8168620",
// };

const args = process.argv;
const phoneNumber = args[2];
const auth = false;

async function start() {
  try {
    const user = await axios
      .get(`http://localhost:3000/api/users/findByPhone/${phoneNumber}`)
      .then((res) => res.data)
      .catch(function (error) {
        if (error.response) {
          console.log(error.response.status);
        } else {
          // Something happened in setting up the request that triggered an Error
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
      // let page = await browser.newPage();
      let pages = await browser.pages();

      const page = pages[0];

      page.on("close", () => {
        console.log("page_closed");
        process.exit(1);
      });

      page.setViewport({ width: 1366, height: 768 });

      process.stdin.on("data", async (data) => {
        if (data == "cycle") {
          try {
            const newPage = await browser.newPage();
            await cycle(newPage, authData);
            console.log("Цикл запущен");
          } catch (e) {
            console.log(e);
          }
        }
      });

      console.log("Основной парсер запущен успешно");
      // await browser.close();
    }
  } catch (e) {
    console.log("Ошибка при запуске парсера...");
    console.log(e.message)
    return e;
  }
}

start();
