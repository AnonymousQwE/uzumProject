const { Telegraf, session } = require("telegraf");
const { Mongo } = require("@telegraf/session/mongodb");
const { startHandler, expectPhoneNumberHandler } = require("./handlers.js");
const commands = require("./commands.js");

const start = async () => {
  const store = Mongo({
    url: "mongodb+srv://admin:admin@uzum.4qdcrwy.mongodb.net/?retryWrites=true&w=majority",
    database: "test",
    collection: "telegram-bot",
  });

  const bot = new Telegraf("6561406851:AAGWRJmuSemEFeirswx86q0cXpc-TJYsaks", {
    handlerTimeout: Infinity,
  });

  bot.use(session({ store, defaultSession: () => ({}) }));

  const status = {
    auth: false,

    main: { state: "stop", start: null },
    products: { state: "stop", lastStart: null },
    invoices: { state: "stop", lastStart: null },
    sales: { state: "stop", lastStart: null },
  };

  // bot.use(session({ defaultSession: () => ({}) }));

  bot.start(startHandler);

  commands.forEach((cmd) => bot.hears(cmd.command, cmd.handler));

  bot.on("text", expectPhoneNumberHandler);

  // bot.hears(/.json/, (ctx) => {
  //   // Здесь вы можете выполнить действие для кнопки 2
  //   ctx.reply(`Вы выбрали ${ctx.match.input}`);
  //   const prods = JSON.parse(
  //     fs.readFileSync(`products/${ctx.match.input}`, "utf8")
  //   ).data;

  //   const keyb = prods.map((p) => [p.title]);

  //   keyb.push([" "], ["Назад в список файлов"]);

  //   ctx.reply("Все товары", {
  //     reply_markup: {
  //       inline_keyboard: keyb,
  //     },
  //   });
  // });

  // bot.hears("Назад в список файлов", async (ctx) => {
  //   const files = await fs.readdirSync(path.normalize("products"));
  //   ctx.reply("Выберите файл:", {
  //     reply_markup: {
  //       keyboard: files.map((f) => [f]),
  //       resize_keyboard: true,
  //     },
  //   });
  // });

  // Запуск бота
  bot.launch();
};
start();
