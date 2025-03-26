const routes = require("express").Router()
const advertisementController = require("../controllers/AdvertisementController")

routes.post("/add",advertisementController.addAdvertisment)
routes.get("/getall",advertisementController.getAllAdvertisment)
routes.get("/getallbyuserId/:userId",advertisementController.getAllAdvertismentbyuserId)
routes.post("/addWithFile",advertisementController.addAdvertismentwithFile)

module.exports = routes