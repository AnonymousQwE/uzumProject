const puppeteer = require("puppeteer");
const { spawn, spawnSync } = require("child_process");
const axios = require("axios");
const { headers } = require("./headers");
const { CheckAuth } = require("../parser/utils");
const { setUserDataForBrowser } = require("../parser/setUserData");
const { AuthFunction } = require("../parser/auth");
const {
  getInvoices,
  getInvoicesProducts,
  getNewTimeSlot,
  setNewTimeslot,
} = require("./api/invoicesApi");

// const authData = {
//   phoneNumber: "+998908221221",
//   password: "Alex@8168620",
// };

const phoneNumber = process.argv[2];
let auth = true;

async function start() {
  try {
    const invoice = await getInvoices();
    // console.log(invoice);
    const invoiceproducts = await getInvoicesProducts(invoice.id);
    const newTimeSlot = await getNewTimeSlot(invoice.id);
    console.log(invoice.timeSlotReservation.timeSlots);
    const bol = newTimeSlot < invoice.timeSlotReservation.timeSlots[0].timeFrom;
    console.log(bol);
    // console.log(await setNewTimeslot(invoice.id, newTimeSlot));
  } catch (e) {
    console.log(e.message);
    return e;
  }
}

start();
