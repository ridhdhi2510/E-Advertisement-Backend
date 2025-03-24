const routes = require("express").Router()
const userController = require("../controllers/UserController")

routes.post("/signup",userController.signup)
routes.get("/getall",userController.getAllUsers)
routes.get("/getbyid/:id",userController.getUserById)
routes.delete("/deletebyid/:id",userController.deleteUser)
routes.post("/login",userController.loginUser)
routes.post("/forgotpassword",userController.forgotPassword)
routes.post("/resetpassword",userController.resetPassword)

module.exports = routes