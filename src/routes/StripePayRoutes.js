const router = require("express").Router();
const stripeController = require("../controllers/StripePayController");

// Create a payment intent for booking
router.post("/create-booking-payment", stripeController.createPaymentIntent);

// Confirm payment completion
router.post("/confirm-booking-payment", stripeController.confirmPayment);


module.exports = router;