const routes = require('express').Router();
const bookingController = require("../controllers/BookingController");


routes.post("/addwithFile", bookingController.addBooking);
routes.get("/getall", bookingController.getAllBookings);
routes.get("/getBookingByid/:id", bookingController.getBookingById);
routes.get("/getBookingByUserId/:userId", bookingController.getBookingsByUserId);
routes.put("/updateBooking/:id", bookingController.updateBooking);
routes.delete("/deleteBooking/:id", bookingController.deleteBooking);

module.exports = routes;

