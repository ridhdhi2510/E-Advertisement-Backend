const routes = require("express").Router()
const cityController= require("../controllers/CityController")
routes.get("/getall",cityController.getCities)
routes.post("/add",cityController.addCity)
routes.get("/getcitybystate/:stateId",cityController.getCityByStateId)


module.exports = routes