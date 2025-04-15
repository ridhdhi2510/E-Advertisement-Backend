const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()
app.use(cors())
app.use(express.json());
require('dotenv').config();


mongoose.connect("mongodb://127.0.0.1:27017/advertisement").then(()=>{
    console.log("database connected....")
})

const userRoutes = require("./src/routes/UserRoutes")
app.use("/user",userRoutes)

const roleRoutes = require("./src/routes/RoleRoutes")
app.use("/role",roleRoutes)

const stateRoutes = require("./src/routes/StateRoutes")
app.use("/state",stateRoutes)

const cityRoutes = require("./src/routes/CityRoutes")
app.use("/city",cityRoutes)

const areaRoutes = require("./src/routes/AreaRoutes")
app.use("/area",areaRoutes)

const hordingRoutes = require("./src/routes/HordingRoutes")
app.use("/hording",hordingRoutes)

const bookingRoutes = require("./src/routes/BookingRoutes");
app.use("/booking", bookingRoutes);

const paymentRoutes = require("./src/routes/PaymentRoutes")
app.use("/payment",paymentRoutes)

// Add this with other route imports
const agencyRoutes = require("./src/routes/AgencyRoutes");
app.use("/agency", agencyRoutes);
 
// In your main server file (e.g., app.js or server.js)
const stripeRoutes = require('./src/routes/StripePayRoutes');
app.use('/stripe', stripeRoutes);

const PORT = 3000
app.listen(PORT,()=>{
    console.log("server started on the port number"+ PORT)
})