// routes/ActivityRoutes.js
const routes = require('express').Router();
const activityController = require('../controllers/ActivityController');

routes.get('/recent', activityController.getRecentActivities);

module.exports = routes;