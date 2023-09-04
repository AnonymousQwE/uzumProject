function sendMainMenu(ctx) {
  ctx.reply("Главное меню", {
    reply_markup: {
      keyboard: [
        ["Первый запуск парсера"],
        ["Запуск парсера"],
        ["Статус парсеров"],
        ["Логи парсеров"],
        ["Настройки"],
      ],
      resize_keyboard: true,
    },
  });
  // ctx.telegram.editMessageText(
  //   mess?.chat.id,
  //   mess?.message_id,
  //   0,
  //   `Child Process Output: ${data}`
  // );
}
module.exports = sendMainMenu;
