const { Telegraf, session, Scenes } = require("telegraf");
const { Mongo } = require("@telegraf/session/mongodb");
const commands = require("./commands.js");
const { startBotHandler } = require("./handlers/mainBotHandlers.js");
const { phoneScene } = require("./scenes/requestPhoneScene.js");
const { passwordScene, passwordConfirmationScene } = require("./scenes/requestPasswordScene.js");
const { mainMenuScene } = require("./scenes/mainMenuScene.js");
const adminList = [761121054, 5677673619, 5006165272, 119103696]


const start = async () => {
  const store = Mongo({
    url: "mongodb+srv://admin:admin@uzum.4qdcrwy.mongodb.net/?retryWrites=true&w=majority",
    database: "test",
    collection: "telegram-bot",
  });

  const bot = new Telegraf("6561406851:AAGWRJmuSemEFeirswx86q0cXpc-TJYsaks", {
    handlerTimeout: Infinity,
  });



  const isAdmin = (ctx) => {
    return adminList.includes(ctx.from.id)
  }

  const stage = new Scenes.Stage([mainMenuScene, phoneScene, passwordScene, passwordConfirmationScene], { ttl: 10 });
  bot.use(session({ store, defaultSession: () => ({}) }));
  bot.use(stage.middleware());





  // bot.use(Telegraf.log())

  bot.use((ctx, next) => {
    if (isAdmin(ctx)) {
      return next()
    } else {
      return ctx.reply("Не хватает прав...", {
        reply_markup: { remove_keyboard: true },
      })
    }
  })


  commands.forEach((cmd) => {
    if (cmd.type === "action") {
      return bot.action(cmd.command, cmd.handler)
    } else if (cmd.type === "hears") {
      return bot.hears(cmd.command, cmd.handler)
    }
  });



  bot.start(startBotHandler);
  bot.launch()
  console.log("Бот запустился!");

  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
};
start();
