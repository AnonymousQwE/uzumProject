const fs = require("fs");
const { AuthFunction } = require("./auth");
const { setUserDataForBrowser } = require("./setUserData");

let link = "https://seller.uzum.uz/seller/finances/?filter=ORDERS";

async function checkAuth(page, process) {
  try {
    // console.log("Проверяем авторизацию...");
    process.send({ type: "message", text: "Проверяем авторизацию..." });
    await page.goto(`${link}`);
    await page.waitForSelector("tr.table__body__row");
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

function timeslotToDate(type, timeslot) {
  console.log(timeslot);

  if (type === "t") {
    const split = timeslot.split(",");
    const date = split[0].split(".");

    let currentDate = new Date(
      Date.parse(`${date[2]}-${date[1]}-${date[0]}T00:00:00`)
    );
    console.log(`oldTimeslot ${date[2]}-${date[1]}-${date[0]}T00:00:00`);

    return currentDate;
  } else if (type === "nt") {
    console.log(timeslot);
    const split = timeslot.split(" ");
    let currentDate = new Date(
      Date.parse(
        `${split[2]}-${monthToNumb(split[1])}-${
          split[0].length < 2 ? "0" + split[0] : split[0]
        }T00:00:00`
      )
    );
    console.log(`newTimeSlot ${currentDate}`);
    return currentDate;
  }
}

function monthToNumb(month) {
  switch (month) {
    case "января":
      return 1;
    case "февраля":
      return 2;
    case "марта":
      return 3;
    case "апреля":
      return 4;
    case "мая":
      return 5;
    case "июня":
      return 6;
    case "июля":
      return 7;
    case "августа":
      return 8;

    case "сентября":
      return 9;

    case "октября":
      return 10;

    case "ноября":
      return 11;

    case "декабря":
      return 12;

    default:
      return 0;
  }
}

module.exports = { checkAuth, timeslotToDate };
