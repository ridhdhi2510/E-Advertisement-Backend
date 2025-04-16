const routes = require("express").Router();
const bankdetailsagencyController = require("../controllers/BankDetailsAgencyController");

routes.post("/add",bankdetailsagencyController.addBankDetails);
routes.get("/getbyuserId/:userId",bankdetailsagencyController.getBankDetailsbyuserId);
routes.get("/getbyuserId/all", bankdetailsagencyController.getAllBankDetails);
routes.put("/update/:userId", bankdetailsagencyController.updateBankDetails);

module.exports = routes;