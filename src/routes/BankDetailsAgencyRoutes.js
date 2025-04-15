const routes = require("express").Router();
const bankdetailsagencyController = require("../controllers/BankDetailsAgencyController");

routes.post("/add",bankdetailsagencyController.addBankDetails);

module.exports = routes;