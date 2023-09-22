let childProcess = require("../constants/childProcessConstants");
let mainStatus = require("../constants/parseStatusConstants")
const { sendProductParseMenuMessage } = require("../menu")

async function productsParseSetupHandler(ctx) {
    await ctx.answerCbQuery()
    await sendProductParseMenuMessage(ctx)
}
async function productsParserStartHandler(ctx) {
    if (childProcess[ctx.session.phoneNumber]?.main?.connected) {
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
    ctx.answerCbQuery()
}
async function timeslotUpdaterStartHandler(ctx) {
    if (childProcess[ctx.session.phoneNumber]?.main?.connected) {
        if (mainStatus[ctx.session.phoneNumber].timeslotUpdater != "work") {
            try {
                childProcess[ctx.session.phoneNumber].main.send({ type: "timeslotUpdater" });
                mainStatus[ctx.session.phoneNumber].timeslotUpdater = true;
                childProcess[ctx.session.phoneNumber].main.on("message", async (message) => {
                    console.log(message);
                    if(message.type == "log"){
                        console.log(message)
                    }
                })
            } catch (e) {
                ctx.reply(`Произошла ошибка при запуске ловли ${e.code}`);
                mainStatus[ctx.session.phoneNumber].timeslotUpdater = false;
                console.log(e);
            }
        } else {
            ctx.reply("Уже запущена ловля...");
            console.log(!mainStatus[ctx.session.phoneNumber].timeslotUpdater)
        }
    } else {
        ctx.reply("Не запущен основной процесс");
    }
    ctx.answerCbQuery()
}

module.exports = { timeslotUpdaterStartHandler, productsParseSetupHandler, productsParserStartHandler }