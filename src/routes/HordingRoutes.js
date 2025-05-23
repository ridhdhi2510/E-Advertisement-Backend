const routes = require('express').Router();
const hordingController = require('../controllers/HordingController');
routes.post('/add', hordingController.addHording);
routes.get('/getall', hordingController.getAllHordings);
routes.get('/getHordingsbyuserid/:userId' , hordingController.getAllHordingsByUserId);
routes.post('/addWithFile', hordingController.addHordingWithFile);
routes.put("/updatehording/:id",hordingController.updateHording);
routes.get("/getHordingById/:id",hordingController.getHordingById);
routes.get('/getHordingsByLocation', hordingController.getHordingsByLocation);
routes.delete("/delete/:id", hordingController.deleteHording);


module.exports = routes;