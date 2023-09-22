const { Scenes, Markup } = require('telegraf');
const { sendMainMenu } = require('../menu');

const mainMenuScene = new Scenes.BaseScene('mainMenu');

mainMenuScene.enter((ctx) => {
    sendMainMenu(ctx);
});

mainMenuScene.leave((ctx) => {
    console.log("LEAVE MAIN MENU")
})

module.exports = { mainMenuScene };