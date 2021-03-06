const express = require("express");

const router = express.Router()

// 引入控制器模块
const UserController = require("../controller/UsersController")

router.get("/userlist", UserController.UserList)
router.post("/register", UserController.UserRegister)
router.post("/login", UserController.UserLogin)
router.post("/getcode", UserController.GetIdentCode)
router.post("/phonelogin", UserController.PhoneLogin)
router.get("/captcha", UserController.SvgCaptcha)


module.exports = router