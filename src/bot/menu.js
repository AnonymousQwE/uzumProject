const { Markup } = require("telegraf");
const mainStatus = require("./constants/parseStatusConstants");
// const { hideMenuHandler } = require("./handlers/mainBotHandlers");

function sendMainMenu(ctx) {
  ctx.reply("Главное меню", {
    reply_markup: {
      keyboard: [
        ["Первый запуск парсера"],
        ["Управление парсерами"],
        ["Статус парсеров"],
        // ["Логи парсеров"],
        // ["Настройки"],
        ["Закрыть все браузеры"]
      ],
      resize_keyboard: true,
    },
  })
}
async function sendParseStartMenuMessage(ctx) {
  // await hideMenuHandler(ctx)
  const oldMessage = await ctx.reply("Управление парсерами...", {
    reply_markup: { remove_keyboard: true }
  })
  await ctx.telegram.deleteMessage(oldMessage.chat.id, oldMessage.message_id)
  await ctx.reply("*Управление парсерами...*", {
    parse_mode: "markdown",
    ...Markup.inlineKeyboard(
      [[Markup.button.callback("Парсер товаров", "productsParserSetting")],
      [Markup.button.callback("Ловля таймслотов", "sendTimeslotUpdaterSetting")],
      [Markup.button.callback("Парсер продаж", "salesParserSetting")],
      [Markup.button.callback("Парсер приходных накладных", "invoicesParserSetting")],
      [Markup.button.callback("Назад", "runToBackMainMenu")],
      ]
    )
  })
}

async function sendProductParseMenuMessage(ctx) {
  // console.log(ctx)
  const chatId = await ctx.chat.id
  const messageId = await ctx.update.callback_query.message.message_id

  await ctx.telegram.editMessageText(
    chatId, messageId, null,
    `_Управление Парсером Товаров_ \n Статус: *${mainStatus[ctx.session.phoneNumber]?.products === "work"
      ? "Запущен, выполняется парсинг..."
      : mainStatus[ctx.session.phoneNumber]?.products
        ? "Запущен, не выполняет парсинг..."
        : "Не запущен..."
    }*`, {
    parse_mode: "markdown", ...Markup.inlineKeyboard(
      [[Markup.button.callback("Запустить/Остановить Таймер Парсер", "productsParserStart")],
      [Markup.button.callback("Установить таймер запуска парсера", "salesParserSetting")],
      [Markup.button.callback("Запустить принудительно парсер 1 раз", "invoicesParserSetting")],
      [Markup.button.callback("Вернуться назад", "runToBackOnParsersSetup")],
      ]
    )
  }
  )
}

async function sendTimeslotUpdaterMenuMessage(ctx) {
  // console.log(ctx)
  const chatId = await ctx.chat.id
  const messageId = await ctx.update.callback_query.message.message_id
  await ctx.answerCbQuery()
  console.log("Выбрана ловля таймслотов")


  const keyboard = Markup.inlineKeyboard(
    [[Markup.button.callback("Запустить/Остановить Таймер Парсер", "timeslotUpdaterStart")],
    [Markup.button.callback("Установить таймер запуска парсера", "timeslotUpdaterSetTimer")],
    [Markup.button.callback("Вернуться назад", "runToBackOnParsersSetup")],
    ]
  )

  await ctx.telegram.editMessageText(
    chatId, messageId, null,
    `_Управление Ловлей Таймслотов_ \n Статус: *${mainStatus[ctx.session.phoneNumber]?.timeslotUpdater === "work"
      ? "Запущен, выполняется..."
      : mainStatus[ctx.session.phoneNumber]?.timeslotUpdater
        ? "Запущен, не выполняется..."
        : "Не запущен..."
    }*`, {
    parse_mode: "markdown", ...keyboard
  }
  )
}

async function sendInvoicesChoiser(ctx, invoices) {
  const filteredInvoices = invoices.filter((inv) => inv.status !== "Принята на складе")
  const keyboard = Markup.inlineKeyboard(filteredInvoices.map((inv) => {
    if (inv.status !== "Принята на складе") {
      return [Markup.button.callback(`№ ${inv.id} |  ${inv.timeslotDate === "Выбрать таймслот" ? "Нет даты слота" : inv.timeslotDate.split(",")[0]} | ${inv.status} `, `setinvoice-${inv.count}`)]
    }
  }))
  ctx.reply("Выберите таймслот для ловли", { parse_mode: "markdown", ...keyboard })
}

const runToBackOnParsersSetupHandler = async (ctx) => {
  await ctx.telegram.deleteMessage(ctx.chat.id, ctx.update.callback_query.message.message_id)
  await ctx.answerCbQuery()
  await sendParseStartMenuMessage(ctx)
}

const runToBackMainMenuHandler = async (ctx) => {
  await ctx.telegram.deleteMessage(ctx.chat.id, ctx.update.callback_query.message.message_id)
  await ctx.answerCbQuery()
  await sendMainMenu(ctx)
}
module.exports = { sendTimeslotUpdaterMenuMessage, sendInvoicesChoiser, sendMainMenu, sendParseStartMenuMessage, sendProductParseMenuMessage, runToBackOnParsersSetupHandler, runToBackMainMenuHandler };
