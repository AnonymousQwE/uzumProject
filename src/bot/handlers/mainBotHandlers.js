const { spawn } = require('node:child_process');
const { sendMainMenu } = require('../menu');
let mainStatus = require('../constants/parseStatusConstants');
let childProcess = require('../constants/childProcessConstants');

function startBotHandler(ctx) {
    if (ctx.session?.phoneNumber == undefined) {
        ctx.scene.enter('phone');
    } else if (ctx.session?.password == undefined) {
        console.log(ctx.session.password)
        ctx.scene.enter('password')
    } else {
        ctx.scene.enter("mainMenu");

    }
}

async function contactHandler(ctx) {
    const contact = ctx.message.contact.phone_number;
    ctx.reply(
        `Вы ввели номер: ${contact}. Подтвердите или измените номер.`,
        Markup.inlineKeyboard([
            [
                Markup.button.callback('Подтвердить', 'confirm'),
                Markup.button.callback('Изменить номер', 'change')
            ]
        ])
    );

};



function closeBrowsers(ctx) {
    spawn("taskkill", ["/IM", "chrome.exe", "/F"]);
    console.log("Мы закрыли все браузеры Chrome!")
    childProcess[ctx.session.phoneNumber]?.main && childProcess[ctx.session.phoneNumber]?.main.kill()
    mainStatus = {}
    ctx.reply("Все браузеры закрыты!")
}

module.exports = { startBotHandler, closeBrowsers, contactHandler }