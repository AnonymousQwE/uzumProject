const childProcess = require("../constants/childProcessConstants");

const timeslotGoCheckHandler = async (ctx) => {
    await ctx.answerCbQuery();
    const invoiceCount = parseInt(ctx.match[1])
    await childProcess[ctx.session.phoneNumber].main.send({ type: "goTimeslotCheck", count: invoiceCount });
    console.log(invoiceCount)
}

module.exports = { timeslotGoCheckHandler }