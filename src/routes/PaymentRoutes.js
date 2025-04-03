const routes = require("express").Router()
const paymentController = require("../controllers/PaymentController")

routes.post("/add",paymentController.addPayment)
routes.get("/getall",paymentController.getAllPayments)
routes.get("/getbyid/:id",paymentController.getPaymentById)
routes.get("/getallbyuserId/:userId",paymentController.getAllPaymentsByUserId)

module.exports = routes