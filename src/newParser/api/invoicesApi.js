const { headers } = require("../headers");

const getInvoices = async (pageCount) => {
  try {
    const res = await fetch(
      "https://api-seller.uzum.uz/api/seller/shop/1814/invoice?page=0&size=20",
      {
        headers,
        body: null,
        method: "GET",
      }
    );
    const data = await res.json();
    return data[0];
  } catch (e) {
    console.log(e.message);
    return e;
  }
};
const getInvoicesProducts = async (invoiceId) => {
  try {
    const res = await fetch(
      `https://api-seller.uzum.uz/api/seller/shop/1814/invoice/getInvoiceProducts?invoiceId=${invoiceId}`,
      {
        headers,
        body: null,
        method: "GET",
      }
    );
    const data = await res.json();
  } catch (e) {
    console.log(e.message);
    return e;
  }
};

const getNewTimeSlot = async (invoiceId, timeFrom) => {
  try {
    const res = await fetch(
      "https://api-seller.uzum.uz/api/seller/shop/1814/v2/invoice/time-slot/get",
      {
        headers,
        body: '{"invoiceIds":[425473],"timeFrom":1695413619143}',
        method: "POST",
      }
    );
    const data = await res.json();
    return data.payload.timeSlots[0].timeFrom;
  } catch (e) {
    console.log(e);
  }
};
const setNewTimeslot = async (invoiceId, timeFrom) => {
  try {
    const res = await fetch(
      "https://api-seller.uzum.uz/api/seller/shop/1814/v2/invoice/time-slot/set",
      {
        headers,
        body: `{"invoiceIds":[${invoiceId}],"timeFrom":${timeFrom}}`,
        method: "POST",
      }
    );
    const data = await res.json();
    return data;
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  getInvoices,
  getInvoicesProducts,
  getNewTimeSlot,
  setNewTimeslot,
};
