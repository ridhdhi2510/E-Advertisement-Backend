const routes = require("express").Router()
const userController = require("../controllers/UserController")

routes.post("/signup",userController.signup)
routes.get("/getall",userController.getAllUsers)
routes.get("/getbyid/:id",userController.getUserById)
routes.delete("/deletebyid/:id",userController.deleteUser)
routes.post("/login",userController.loginUser)


module.exports = routes