const routes = require("express").Router()
const stateController= require("../controllers/StateController")
routes.get("/getall",stateController.getAllStates)
routes.post("/add",stateController.addState)



module.exports = routes