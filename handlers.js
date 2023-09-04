// import { sendMainMenu } from "./menu.js";

// import { spawn } from "child_process";
// import path from "path";
const sendMainMenu = require("./menu.js");
const { spawn } = require("child_process");
const path = require("path");

const childProcess = {};

function startHandler(ctx) {
  if (ctx.session?.phoneNumber) {
    ctx.reply("Привет! Добро пожаловать!");
    sendMainMenu(ctx);
  } else {
    ctx.session.expectPhoneNumber = true;
    ctx.reply("Введите Ваш номер телефона в формате +998*********", {
      reply_markup: { remove_keyboard: true },
    });
  }
}

async function startParserHandler(ctx) {
  try {
    ctx.reply("Вы выбрали запуск парсера");
    childProcess.main.stdin.write("cycle");
    if (childProcess.main) {
      ctx.reply("Парсинг запустился");
    } else {
    }
  } catch (e) {
    ctx.reply("Не запущен основной процесс");
    console.log(e);
  }
}

async function mainParserStartHandler(ctx) {
  try {
    childProcess.main = spawn(
      "node",
      [path.normalize("main.js"), "+998908221221"],
      {
        // stdio: ["pipe", "pipe", "pipe", "ipc"],
      }
    );

    childProcess.main.stdout.on("data", async (data) => {
      console.log(`Child Process Output: ${data}`);

      ctx.reply(`${data}`);

      // ctx.telegram.editMessageText(
      //   mess?.chat.id,
      //   mess?.message_id,
      //   0,
      //   `Child Process Output: ${data}`
      // );
    });

    childProcess.main.stderr.on("data", (data) => {
      console.error(`Child Process Error: ${data}`);
      // ctx.reply(`Child Process Error: ${data}`);
      ctx.reply("Ошибка");
    });
    childProcess.main.on("close", (code) => {
      console.log(`Дочерний процесс завершился с кодом ${code}`);
    });
    ctx.session.browserStatus = "wait";
  } catch (e) {
    console.log(e);
  }
}

async function expectPhoneNumberHandler(ctx) {
  const message = ctx.message.text;

  if (ctx.session.expectPhoneNumber) {
    const phoneNumber = message;

    ctx.session.expectPhoneNumber = false;

    await sendMainMenu(ctx);
    ctx.reply(`Вы ввели номер телефона: ${phoneNumber}`);
    ctx.session.phoneNumber = phoneNumber;
  } else {
  }
}

function parserLogHandler(ctx) {
  // Здесь вы можете выполнить действие для кнопки 2
  ctx.reply("Вы выбрали Логи парсеров");
}

function settingsHandler(ctx) {
  // Здесь вы можете выполнить действие для кнопки 2
  console.log(ctx.session);
  //   ctx.reply(ctx.session);
}

function parserStatusHandler(ctx) {
  // Здесь вы можете выполнить действие для кнопки 2
  ctx.replyWithMarkdownV2(
    `*Авторизация:* _${
      ctx.session?.authStatus ? "Авторизован" : "Не авторизован"
    }_ \n *Главный процесс:* _${
      childProcess.main?.exitCode
        ? "Остановлен"
        : childProcess.main
        ? "Запущен"
        : "Не запущен"
    }_ \n *Парсинг продуктов:* _${ctx.state.ProductStatus}_`
  );
  console.log(childProcess);
}

module.exports = { startHandler, mainParserStartHandler };
