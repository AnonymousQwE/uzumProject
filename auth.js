const { default: axios } = require("axios");
const fs = require("fs");
const puppeteer = require("puppeteer");

let link = "https://seller.uzum.uz/seller/signin";

// AuthFunction();

async function AuthFunction(page, authData) {
  console.log("AUTH STARTED");
  try {
    await page.goto(`${link}`);

    await page.waitForSelector("div.auth");
    await page.locator("#username").fill(authData.phoneNumber);
    await page.locator("#password").fill(authData.password);
    await page.locator(`[data-test-id="button__next"]`).click();

    // let firstTitle;

    await page.locator("div#navigation-bottom a.profile").click();

    await page.waitForSelector(".profile");

    const cookies = await page.cookies();

    await axios.put(
      "http://localhost:3000/api/users",
      { id: authData.id, cookies: JSON.stringify(cookies) },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("COOKIES SAVED!");

    const localStorage = await page.evaluate(() => {
      return { ...localStorage };
    });

    console.log(JSON.stringify(localStorage));

    await axios.put(
      "http://localhost:3000/api/users",
      { id: authData.id, localStorage: JSON.stringify(localStorage) },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Local Storage Saved!");
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

module.exports = { AuthFunction };
