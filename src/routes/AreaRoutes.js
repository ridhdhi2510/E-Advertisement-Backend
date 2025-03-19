const routes = require("express").Router()
const areaController= require("../controllers/AreaController")
routes.get("/getall",areaController.getAreas)
routes.post("/add",areaController.addArea)
routes.get("/getareabycity/:cityId",areaController.getAreaBycityId)


module.exports = routes