const { closeBrowsers } = require("./handlers/mainBotHandlers.js");
const { mainParserStartHandler, startParserHandler, parserLogHandler, settingsHandler, parserStatusHandler } = require("./handlers/parsersHandlers.js");
const { productsParseSetupHandler, productsParserStartHandler, timeslotUpdaterStartHandler } = require("./handlers/productsHandlers.js");
const { timeslotGoCheckHandler } = require("./handlers/timeslotCheckerHandlers.js");
const { runToBackOnParsersSetupHandler, runToBackMainMenuHandler, sendTimeslotUpdaterMenuMessage } = require("./menu.js");
const commands = [
  { command: "Первый запуск парсера", handler: mainParserStartHandler, type: "hears" },
  { command: "Управление парсерами", handler: startParserHandler, type: "hears" },
  { command: "Логи парсеров", handler: parserLogHandler, type: "hears" },
  { command: "Настройки", handler: settingsHandler, type: "hears" },
  { command: "Статус парсеров", handler: parserStatusHandler, type: "hears" },
  { command: "Закрыть все браузеры", handler: closeBrowsers, type: "hears" },
  { command: "productsParserSetting", handler: productsParseSetupHandler, type: "action" },
  { command: "sendTimeslotUpdaterSetting", handler: sendTimeslotUpdaterMenuMessage, type: "action" },
  { command: "runToBackOnParsersSetup", handler: runToBackOnParsersSetupHandler, type: "action" },
  { command: "runToBackMainMenu", handler: runToBackMainMenuHandler, type: "action" },
  { command: "productsParserStart", handler: productsParserStartHandler, type: "action" },
  { command: "timeslotUpdaterStart", handler: timeslotUpdaterStartHandler, type: "action" },
  { command: /setinvoice-(\d+)/, handler: timeslotGoCheckHandler, type: "action" },

];
module.exports = commands;
