const mongoose = require("mongoose");
const express = require("express");
const UserModel = require("./models/UserModel");
const ProductModel = require("./models/ProductModel");
const productsRouter = require("./routers/productsRouter");
const usersRouter = require("./routers/usersRouter");
const app = express();
const jsonParser = express.json();

app.use(express.static(__dirname + "/public"));

async function main() {
  try {
    await mongoose.connect(
      "mongodb+srv://admin:admin@uzum.4qdcrwy.mongodb.net/?retryWrites=true&w=majority"
    );
    app.listen(3000);
    console.log("Сервер ожидает подключения...");
  } catch (err) {
    return console.log(err);
  }
}

app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);

main();
// прослушиваем прерывание работы программы (ctrl-c)
process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("Приложение завершило работу");
  process.exit();
});
