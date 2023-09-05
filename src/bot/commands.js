const {
  mainParserStartHandler,
  startParserHandler,
  parserLogHandler,
  settingsHandler,
  parserStatusHandler,
} = require("./handlers.js");
const commands = [
  { command: "Первый запуск парсера", handler: mainParserStartHandler },
  { command: "Запуск парсера", handler: startParserHandler },
  { command: "Логи парсеров", handler: parserLogHandler },
  { command: "Настройки", handler: settingsHandler },
  { command: "Статус парсеров", handler: parserStatusHandler },
];
module.exports = commands;