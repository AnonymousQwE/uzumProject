const fs = require("fs");
const { AuthFunction } = require("./auth");

async function setUserDataForBrowser(page, authData) {
  let error = false;
  try {
    // const JSONLocalStorage = await fs.readFileSync(
    //   `localStorage/localStorage-${authData.honeNumb}.json`,
    //   "utf8"
    // );

    const JSONLocalStorage = authData.localStorage;

    const state = await JSON.parse(JSON.parse(JSONLocalStorage).state);

    // state.finance.pageSize = 100;

    const newLocalStorage = await {
      ...JSON.parse(JSON.parse(JSONLocalStorage).state),
      state: JSON.stringify(state),
    };

    await page.evaluateOnNewDocument((values) => {
      for (const key in values) {
        localStorage.setItem(key, values[key]);
      }
      return localStorage;
    }, newLocalStorage);
  } catch (error) {
    if (error.code == "ENOENT") {
      return page;
    }
    console.log(error);
    throw Error;
  }

  try {
    // const cookies = fs.readFileSync(
    //   `cookies/cookies-${authData.phoneNumber}.json`,
    //   "utf8"
    // );

    const cookies = authData.cookies;

    await page.setCookie(...JSON.parse(cookies));
  } catch (e) {
    // console.log(e);
    error = true;
  }

  if (error) {
    console.log("ERROR");
    console.log(error);
    throw error;
  } else return page;
}
module.exports = { setUserDataForBrowser };
