var express = require('express');

var router = express.Router();
var trafficCounterController = require('../controllers/trafficCounterController.js');

//router.get('/', trafficCounterController.list);

//localhost:3002/trafficCounter/videm

router.get('/coords', trafficCounterController.trafficCounter);

module.exports = router;