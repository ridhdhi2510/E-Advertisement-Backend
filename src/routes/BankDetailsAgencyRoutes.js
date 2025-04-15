const routes = require("express").Router();
const bankdetailsagencyController = require("../controllers/BankDetailsAgencyController");

routes.post("/add",bankdetailsagencyController.addBankDetails);
routes.get("/getbyuserId/:userId",bankdetailsagencyController.getBankDetailsbyuserId);

module.exports = routes;