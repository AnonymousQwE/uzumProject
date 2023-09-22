const path = require('node:path');
const { fork, spawn } = require('node:child_process');

let childProcess = require("../constants/childProcessConstants");
let mainStatus = require("../constants/parseStatusConstants");
const { sendInvoicesChoiser, sendParseStartMenuMessage } = require('../menu');
let { productMessages } = require('../constants/messagesConstants');

async function mainParserStartHandler(ctx) {
    if (!mainStatus[ctx.session.phoneNumber]) {
        mainStatus[ctx.session.phoneNumber] = {}
    }
    if (!childProcess[ctx.session.phoneNumber]?.main || !childProcess[ctx.session.phoneNumber] || childProcess[ctx.session.phoneNumber].main.exitCode > 0 || childProcess[ctx.session.phoneNumber].main.killed) {
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
                if (message.type === "user") {
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
                if (message.type === "invoices") {
                    const invoices = message.data
                    sendInvoicesChoiser(ctx, invoices)
                }
                if (message.type === "exit") {
                    ctx.reply(`${message.text}`);
                    ctx.session.browserStatus = "closed";
                }
                if (message.type === "productMessage") {
                    if (message.first) {
                        if (message.shopId) {
                            productMessages[message.shopId] = await ctx.replyWithMarkdownV2(
                                message.text
                            );
                        } else {
                            ctx.reply(message.text, {
                                parse_mode: "markdown"
                            });
                        }
                    } else {
                        if (productMessages[message.shopId]?.chat) {
                            ctx.telegram.editMessageText(
                                productMessages[message.shopId].chat.id,
                                productMessages[message.shopId].message_id,
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
                spawn("taskkill", ["/IM", "chrome.exe", "/F"]);
            });
            ctx.session.browserStatus = "wait";
        } catch (e) {
            console.log(e);
        }
    } else {
        console.log(childProcess)
        ctx.reply('😡Основной парсер уже запущен! Не надо их плодить!!!😡')
    }
}

async function startParserHandler(ctx) {
    sendParseStartMenuMessage(ctx)

}

function parserLogHandler(ctx) {
    ctx.reply("Вы выбрали Логи парсеров");
}

function settingsHandler(ctx) {
    console.log(ctx.session);
}

function parserStatusHandler(ctx) {
    ctx.reply(`*Главный процесс:* _${childProcess[ctx.session.phoneNumber] && childProcess[ctx.session.phoneNumber]?.main?.exitCode !== null ? "⛔️" : childProcess[ctx.session.phoneNumber]?.main ? "✅" : "⛔️"
        }_  \n *Авторизация:* _${mainStatus[ctx.session.phoneNumber]?.auth === "work"
            ? "💼"
            : mainStatus[ctx.session.phoneNumber]?.auth
                ? "✅"
                : "⛔️"
        }_ \n *Парсинг продуктов:* _${mainStatus[ctx.session.phoneNumber]?.products === "work"
            ? "💼"
            : mainStatus[ctx.session.phoneNumber]?.products
                ? "✅"
                : "⛔️"
        }_`, {
        parse_mode: "markdown"
    });
}

module.exports = {
    mainParserStartHandler,
    startParserHandler,
    parserLogHandler,
    settingsHandler,
    parserStatusHandler
}