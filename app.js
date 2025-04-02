const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()
app.use(cors())
app.use(express.json());


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


// const bookingRoutes = require("./src/routes/BookingRoutes");
// app.use("/booking", bookingRoutes);



const PORT = 3000
app.listen(PORT,()=>{
    console.log("server started on the port number"+ PORT)
})