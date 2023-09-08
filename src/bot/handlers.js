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
  if (!mainStatus[ctx.session.phoneNumber]) {
    mainStatus[ctx.session.phoneNumber] = {}
  }
  if (!childProcess[ctx.session.phoneNumber] && !childProcess[ctx.session.phoneNumber]?.main) {
    try {
      childProcess[ctx.session.phoneNumber] = {}
      childProcess[ctx.session.phoneNumber].main = fork(
        path.normalize("src/parser/main.js"),
        [ctx.session.phoneNumber],
        { stdio: ["pipe", "pipe", "pipe", "ipc"] }
      );

      childProcess[ctx.session.phoneNumber].main.on("message", async (message) => {
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
            mainStatus[ctx.session.phoneNumber].auth = message.status;
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
            mainStatus[ctx.session.phoneNumber].products = message.status
            console.log(`Статус парсинга продуктов установлен ${message.status}`)
          }
        }

      });

      childProcess[ctx.session.phoneNumber].main.stderr.on("data", (data) => {
        console.error(`Child Process Error: ${data}`);
      });
      childProcess[ctx.session.phoneNumber].main.on("exit", (code) => {
        console.log(`Дочерний процесс завершился с кодом ${code}`);
        mainStatus[ctx.session.phoneNumber].auth = false;
        mainStatus[ctx.session.phoneNumber].products = false;
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
  if (childProcess[ctx.session.phoneNumber].main?.connected) {
    if (mainStatus[ctx.session.phoneNumber].products != "work") {
      try {
        childProcess[ctx.session.phoneNumber].main.send({ type: "products" });
        mainStatus[ctx.session.phoneNumber].products = true;
      } catch (e) {
        ctx.reply(`Произошла ошибка при запуске парсинга ${e.code}`);
        mainStatus[ctx.session.phoneNumber].products = false;
        console.log(e);
      }
    } else {
      ctx.reply("Уже запущен парсер товаров...");
      console.log(!mainStatus[ctx.session.phoneNumber].products)
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
    `*Главный процесс:* _${childProcess[ctx.session.phoneNumber] && childProcess[ctx.session.phoneNumber]?.main?.exitCode !== null ? "⛔️" : childProcess[ctx.session.phoneNumber]?.main ? "✅" : "⛔️"
    }_  \n *Авторизация:* _${mainStatus[ctx.session.phoneNumber]?.auth === "work" ? "💼" : mainStatus[ctx.session.phoneNumber]?.auth ? "✅" : "⛔️"
    }_ \n *Парсинг продуктов:* _${mainStatus[ctx.session.phoneNumber]?.products === "work"
      ? "💼"
      : mainStatus[ctx.session.phoneNumber]?.products
        ? "✅"
        : "⛔️"
    }_`
  );
  console.log(mainStatus)
  console.log(childProcess[ctx.session.phoneNumber])
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
