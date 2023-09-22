const { Scenes, Markup } = require('telegraf');

const passwordScene = new Scenes.BaseScene('password');
let enteredPassword
passwordScene.enter((ctx) => {
    ctx.reply('Введите пароль:', {
        reply_markup: { remove_keyboard: true }
    });
});

passwordScene.on('text', async (ctx) => {
    enteredPassword = ctx.message.text;
    // Сохраняем пароль для подтверждения
    // ctx.scene.session.tempPassword = enteredPassword;

    const keyboard = await Markup.inlineKeyboard([
        Markup.button.callback('Сохранить', 'save_password'),
        Markup.button.callback('Изменить', 'change_password')
    ]);

    await ctx.reply(`Вы ввели: ${enteredPassword}`, keyboard);
    // Переходим в сцену подтверждения
    await ctx.scene.enter('password_confirmation');
});

const passwordConfirmationScene = new Scenes.BaseScene('password_confirmation');

passwordConfirmationScene.action('save_password', (ctx) => {
    ctx.session.password = enteredPassword;
    ctx.reply('Пароль успешно установлен.');
    ctx.scene.leave();
    ctx.scene.enter("mainMenu")
});

passwordConfirmationScene.action('change_password', (ctx) => {
    ctx.answerCbQuery()
    ctx.scene.enter('password');
});

passwordConfirmationScene.leave((ctx) => {

})

module.exports = { passwordScene, passwordConfirmationScene };