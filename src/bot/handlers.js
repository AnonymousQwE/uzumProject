const sendMainMenu = require("./menu.js");
const { spawn, fork } = require("child_process");
const path = require("path");

const childProcess = {};

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

// async function mainParserStartHandler(ctx) {
//   try {
//     // childProcess.main = spawn(
//     //   "node",
//     //   [path.normalize("src/parser/main.js"), "+998908221221"],
//     //   {
//     //     stdio: ["pipe", "pipe", "pipe", "ipc"],
//     //   }
//     // );

//     childProcess.main.stdout.on("data", async (data) => {
//       console.log(`Child Process Output: ${data}`);

//       ctx.reply(`${data}`);

//       // ctx.telegram.editMessageText(
//       //   mess?.chat.id,
//       //   mess?.message_id,
//       //   0,
//       //   `Child Process Output: ${data}`
//       // );
//     });

//     childProcess.main.stderr.on("data", (data) => {
//       console.error(`Child Process Error: ${data}`);
//       // ctx.reply(`Child Process Error: ${data}`);
//       ctx.reply(`Ошибка при выполнении парсинга...`);
//     });
//     childProcess.main.on("close", (code) => {
//       console.log(`Дочерний процесс завершился с кодом ${code}`);
//     });
//     ctx.session.browserStatus = "wait";
//   } catch (e) {
//     console.log(e);
//   }
// }

async function mainParserStartHandler(ctx) {
  try {
    childProcess.main = fork(path.normalize("src/parser/main.js"), [
      "+998908221221",
    ]);

    childProcess.main.on("message", async (message) => {
      console.log(`Child Process Output: ${message}`);

      if (message.type === "message") {
        ctx.reply(`${message.text}`);
      }
      if (message.type === "exit") {
        ctx.reply(`${message.text}`);
        ctx.session.browserStatus = "closed";
      }

      // ctx.telegram.editMessageText(
      //   mess?.chat.id,
      //   mess?.message_id,
      //   0,
      //   `Child Process Output: ${data}`
      // );
    });

    // childProcess.main.stderr.on("data", (data) => {
    //   console.error(`Child Process Error: ${data}`);
    //   // ctx.reply(`Child Process Error: ${data}`);
    //   ctx.reply(`Ошибка при выполнении парсинга...`);
    // });
    // childProcess.main.on("exit", (code) => {
    //   console.log(`Дочерний процесс завершился с кодом ${code}`);
    // });
    ctx.session.browserStatus = "wait";
  } catch (e) {
    console.log(e);
  }
}

async function startParserHandler(ctx) {
  try {
    if (!childProcess.main) {
      childProcess.main.send("products");
      ctx.reply("Парсинг запустился");
    } else {
      ctx.reply("Не запущен основной процесс");
    }
  } catch (e) {
    ctx.reply("Не запущен основной процесс");
    console.log(e);
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
  // Здесь вы можете выполнить действие для кнопки 2
  ctx.reply("Вы выбрали Логи парсеров");
}

function settingsHandler(ctx) {
  // Здесь вы можете выполнить действие для кнопки 2
  console.log(ctx.session);
  //   ctx.reply(ctx.session);
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
  console.log(childProcess);
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
