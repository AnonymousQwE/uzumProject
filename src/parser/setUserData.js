const fs = require("fs");

async function setUserDataForBrowser(page, authData) {
  try {
    const JSONLocalStorage = authData.localStorage;
    const state = await JSON.parse(JSON.parse(JSONLocalStorage).state);

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

    const cookies = authData.cookies;
    await page.setCookie(...JSON.parse(cookies));
    return page;
  } catch (e) {
    console.log(e.code);
    if (e.code == "ENOENT") {
      return page;
    }
  }
}
module.exports = { setUserDataForBrowser };
