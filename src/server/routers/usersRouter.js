var express = require("express");
const UserModel = require("../models/UserModel");
var usersRouter = express.Router();
const jsonParser = express.json();

usersRouter.get("/", async (req, res) => {
  // получаем всех пользователей
  const users = await UserModel.find({});
  res.send(users);
});

usersRouter.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // получаем одного пользователя по id
    const user = await UserModel.findById(id);
    if (user) res.send(user);
    else res.sendStatus(404);
  } catch (error) {
    console.log(error);
  }
});

usersRouter.get("/findByPhone/:phoneNumber", async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber;
    // получаем одного пользователя по id
    const user = await UserModel.findOne({ phoneNumber });
    if (user) res.send(user);
    else res.sendStatus(404);
  } catch (error) {
    console.log(error);
  }
});

usersRouter.post("/", jsonParser, async (req, res) => {
  try {
    if (!req.body) return res.sendStatus(400);

    const phoneNumber = req.body.phoneNumber;
    const password = req.body.password;
    const cookies = req.body.cookies;
    const localStorage = req.body.localStorage;
    const user = new UserModel({
      phoneNumber,
      password,
      cookies,
      localStorage,
    });
    // сохраняем в бд
    await user.save();
    res.send(user);
  } catch (error) {
    console.log(error);
  }
});

usersRouter.delete("/:id", async (req, res) => {
  const id = req.params.id;
  // удаляем по id
  const user = await UserModel.findByIdAndDelete(id);
  if (user) res.send(user);
  else res.sendStatus(404);
});

usersRouter.put("/", jsonParser, async (req, res) => {
  if (!req.body) return res.sendStatus(400);
  console.log(req.body);
  const id = req.body.id;
  const phoneNumber = req.body.phoneNumber;
  const password = req.body.password;
  const cookies = req.body.cookies;
  const localStorage = req.body.localStorage;
  const newUser = { phoneNumber, password, cookies, localStorage };
  // обновляем данные пользователя по id
  const user = await UserModel.findOneAndUpdate({ _id: id }, newUser, {
    new: true,
  });
  if (user) res.send(user);
  else res.sendStatus(404);
});

module.exports = usersRouter;
