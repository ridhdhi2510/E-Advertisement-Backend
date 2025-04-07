const routes = require("express").Router();
const agencyController = require("../controllers/AgencyController");

routes.get("/agencies", agencyController.getAllAgencies);
routes.get("/agency-bank-details", agencyController.getAgencyBankDetails);
routes.put("/update-bank-details/:id", agencyController.updateAgencyBankDetails);

module.exports = routes;