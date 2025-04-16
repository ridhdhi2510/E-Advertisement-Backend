const routes = require("express").Router();
const customerController = require("../controllers/CustomerController");

routes.get("/customers", customerController.getAllCustomers);

module.exports = routes;