const sendMainMenu = require("./menu.js");
const { spawn, fork } = require("child_process");
const path = require("path");

const childProcess = {};
const chatId = {};
const setChatId = (id) => {
  chatId.products = id;
};

function startBotHandler(ctx) {
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

async function mainParserStartHandler(ctx) {
  let productMessage;
  try {
    childProcess.main = fork(
      path.normalize("src/parser/main.js"),
      ["+998908221221"],
      { stdio: ["pipe", "pipe", "pipe", "ipc"] }
    );

    childProcess.main.on("message", async (message) => {
      console.log(message);

      if (message.type === "message") {
        await ctx.reply(`${message.text}`);
      }
      if (message.type === "error") {
        ctx.reply(`Ошибка: ${message.text}`);
      }
      if (message.type === "exit") {
        ctx.reply(`${message.text}`);
        ctx.session.browserStatus = "closed";
      }
      if (message.type === "productMessage") {
        if (message.first) {
          productMessage = await ctx.replyWithMarkdownV2(message.text);
        } else {
          console.log(productMessage);
          productMessage?.chat &&
            ctx.telegram.editMessageText(
              productMessage.chat.id,
              productMessage.message_id,
              0,
              `${message.text}`,
              {
                parse_mode: "markdown",
              }
            );
        }
      }

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
      ctx.reply(`Ошибка при выполнении парсинга...`);
    });
    childProcess.main.on("exit", (code) => {
      console.log(`Дочерний процесс завершился с кодом ${code}`);
    });
    ctx.session.browserStatus = "wait";
  } catch (e) {
    console.log(e);
  }
}

async function startParserHandler(ctx) {
  if (childProcess?.main?.connected) {
    try {
      childProcess.main.send({ type: "products", setChatId });
      ctx.reply("Парсинг запустился");
    } catch (e) {
      ctx.reply(`Произошла ошибка при запуске парсинга ${e.code}`);
      console.log(e);
    }
  } else {
    ctx.reply("Не запущен основной процесс");
  }
}

async function expectPhoneNumberHandler(ctx) {
  const message = ctx.message.text;

  if (ctx.session.expectPhoneNumber) {
    const phoneNumber = message;

    ctx.session.expectPhoneNumber = false;
    ctx.session.phoneNumber = phoneNumber;

    ctx.reply(`Вы ввели номер телефона: ${phoneNumber}`);
    await sendMainMenu(ctx);
  } else {
  }
}

function parserLogHandler(ctx) {
  ctx.reply("Вы выбрали Логи парсеров");
  console.log(chatId);
}

function settingsHandler(ctx) {
  console.log(ctx.session);
}

function parserStatusHandler(ctx) {
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
}

module.exports = {
  startBotHandler,
  mainParserStartHandler,
  startParserHandler,
  expectPhoneNumberHandler,
  parserLogHandler,
  settingsHandler,
  parserStatusHandler,
};
