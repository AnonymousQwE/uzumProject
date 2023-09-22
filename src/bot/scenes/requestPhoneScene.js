const { Scenes, Markup } = require('telegraf');
const { sendMainMenu } = require('../menu');
const { enter, leave } = Scenes.Stage

const phoneScene = new Scenes.BaseScene('phone');
let tempPhoneNumber;

function formatPhoneNumber(number) {
    // Удаляем все нецифровые символы
    const cleaned = ('' + number).replace(/\D/g, '');
    // Проверяем, начинается ли номер с 998 или 9
    const match = cleaned.match(/^(998)?(9\d{2}\d{6})$/);
    if (match) {
        const intlCode = '+998';
        return intlCode + match[2];
    }
    return null;
}

phoneScene.enter(async (ctx) => {
    await ctx.reply("Вы входите в первый раз! У вас не задан номер телефона...", {
        reply_markup: { remove_keyboard: true }
    })
    await ctx.reply('Пожалуйста, отправьте ваш номер телефона.', Markup.inlineKeyboard([
        Markup.button.callback('Отправить контакт', 'send_contact'),
        Markup.button.callback('Ввести в ручную', 'enter_manually')
    ]));
});

phoneScene.action('enter_manually', (ctx) => {
    ctx.reply('Введите ваш номер телефона вручную.');
});


phoneScene.action('send_contact', (ctx) => {
    ctx.reply('Пожалуйста, отправьте ваш контакт через функцию Telegram', {
        parse_mode: "MarkdownV2",
        reply_markup: {
            one_time_keyboard: true,
            keyboard: [
                [
                    {
                        text: "Отправить контакт",
                        request_contact: true
                    }
                ]
            ],
            force_reply: true,
        }
    });
});

phoneScene.on("contact", async (ctx) => {
    const contact = await ctx.message.contact.phone_number
    console.log(contact)
    ctx.session.phoneNumber = contact
    await ctx.reply(`Номер ${contact} сохранен`)
    await ctx.scene.leave()
})

phoneScene.action("confirm", async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session.phoneNumber = tempPhoneNumber; // Убедитесь, что tempPhoneNumber доступен здесь
    await ctx.reply(`Ваш номер ${tempPhoneNumber} подтвержден.`);
    await ctx.scene.leave()
    console.log(ctx.session.phoneNumber)
})

phoneScene.action('change', (ctx) => {
    ctx.answerCbQuery();
    ctx.scene.enter('phone');
});

phoneScene.on('message', async (ctx) => {
    const phoneNumber = ctx.message.text;
    const isValid = /^(\+998|998)?[0-9]{9}$/.test(phoneNumber);
    if (isValid) {
        tempPhoneNumber = await formatPhoneNumber(phoneNumber);
        ctx.reply(`Это ваш номер? ${tempPhoneNumber}`, Markup.inlineKeyboard([
            Markup.button.callback('Подтвердить', 'confirm'),
            Markup.button.callback('Изменить номер', 'change')
        ]));
    } else {
        ctx.reply('Номер введен некорректно. Пожалуйста, попробуйте еще раз.');
    }
});

phoneScene.leave((ctx) => {
    console.log(!ctx.session?.password)
    console.log(ctx.session?.password)
    if (ctx.session?.password == undefined) {
        ctx.scene.enter("password")
    } else {
        ctx.scene.enter("mainMenu")
    }
})

module.exports = { phoneScene, tempPhoneNumber };