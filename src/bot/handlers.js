const sendMainMenu = require("./menu.js");
const { spawn, fork } = require("child_process");
const path = require("path");

let childProcess = {};
const chatId = {};
let mainStatus = {};
let productMessage = {};
let authMessage;

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
  if (!childProcess.main) {
    try {
      childProcess.main = fork(
        path.normalize("src/parser/main.js"),
        [ctx.session.phoneNumber],
        { stdio: ["pipe", "pipe", "pipe", "ipc"] }
      );

      childProcess.main.on("message", async (message) => {
        console.log(message);

        if (message.type === "message") {
          await ctx.reply(`${message.text}`, {
            parse_mode: "markdown",
          });
        }
        if (message.type === "auth") {
          if (message.first) {
            authMessage = await ctx.reply(message.text, {
              parse_mode: "markdown",
            });
          } else {
            ctx.telegram.editMessageText(
              authMessage.chat.id,
              authMessage.message_id,
              0,
              `${message.text}`,
              {
                parse_mode: "markdown",
              }
            );
          }
          if (message.status) {
            mainStatus.auth = message.status;
          }
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
            if (message.shopId) {
              productMessage[message.shopId] = await ctx.replyWithMarkdownV2(
                message.text
              );
            } else {
              ctx.reply(message.text, {
                parse_mode: "markdown"
              });
            }
          } else {
            if (productMessage[message.shopId]?.chat) {
              ctx.telegram.editMessageText(
                productMessage[message.shopId].chat.id,
                productMessage[message.shopId].message_id,
                0,
                `${message.text}`,
                {
                  parse_mode: "markdown",
                }
              );
            }
          }
          if (message.status) {
            mainStatus.products = message.status
            console.log(`Статус парсинга продуктов установлен ${message.status}`)
          }
        }

      });

      childProcess.main.stderr.on("data", (data) => {
        console.error(`Child Process Error: ${data}`);
      });
      childProcess.main.on("exit", (code) => {
        console.log(`Дочерний процесс завершился с кодом ${code}`);
        mainStatus.auth = false;
        mainStatus.products = false;
      });
      ctx.session.browserStatus = "wait";
    } catch (e) {
      console.log(e);
    }
  } else {
    ctx.reply('😡Основной парсер уже запущен! Не надо их плодить!!!😡')
  }
}

async function startParserHandler(ctx) {
  if (childProcess?.main?.connected) {
    if (mainStatus.products != "work") {
      try {
        childProcess.main.send({ type: "products" });
        mainStatus.products = true;
      } catch (e) {
        ctx.reply(`Произошла ошибка при запуске парсинга ${e.code}`);
        mainStatus.products = false;
        console.log(e);
      }
    } else {
      ctx.reply("Уже запущен парсер товаров...");
      console.log(!mainStatus.products)
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
    `*Главный процесс:* _${childProcess.main?.exitCode !== null ? "⛔️" : childProcess.main ? "✅" : "⛔️"
    }_  \n *Авторизация:* _${mainStatus.auth === "work" ? "💼" : mainStatus.auth ? "✅" : "⛔️"
    }_ \n *Парсинг продуктов:* _${mainStatus?.products === "work"
      ? "💼"
      : mainStatus.products
        ? "✅"
        : "⛔️"
    }_`
  );
}

function closeBrowsers(ctx) {
  spawn("taskkill", ["/IM", "chrome.exe", "/F"]);
  console.log("Мы закрыли все браузеры Chrome!")
  childProcess = {}
  mainStatus = {}
  ctx.reply("Все браузеры закрыты!")
}

module.exports = {
  startBotHandler,
  mainParserStartHandler,
  startParserHandler,
  expectPhoneNumberHandler,
  parserLogHandler,
  settingsHandler,
  parserStatusHandler,
  closeBrowsers
};
