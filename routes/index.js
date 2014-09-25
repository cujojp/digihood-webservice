var express = require('express');
var router = express.Router();
var Firebase = require('firebase');
var _ = require('underscore');
var config = require('../_config');
var TwilioClient = require('twilio');
var client = TwilioClient(
      process.env.TWILIO_SID || config.twilio.sid, 
      process.env.TWILIO_TOKEN || config.twilio.auth_token);
var beacons = {};
var currBeacon = null;

var fireBaseRef = new Firebase("https://digihood.firebaseio.com/beacons/")
    .once('value', function(snap) { 
    beacons = snap.val();
});

var findById = function(id, cb) {
  _.find(beacons, function(beacon) {
    if (id === beacon.id) {
      return cb(beacon);
    }
  });

  cb(currBeacon);
};


/* GET Home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


/**
 * Will run from a form submision and submit new data.
 */
router.post('/api/update-beacon/', function(req, res) {
  var locationId = req.body.id;
  var phone = '+1' + req.body.phone;
  
  findById(locationId, function(data) {
    if (data) {
      var objIndex = beacons.indexOf(data)
      
      client.sendMessage({
        to: phone,
        from: '+14159694041',
        body: data.notifications.description[0].confirmation
      }, function(err, responseData) {
        if (!err) { 
          console.log(responseData);
        }
      });

      beaconInstance = new Firebase('https://digihood.firebaseio.com/beacons/'+objIndex);
      beaconInstance.update({ reward: false });

      res.send({ msg: 'Succesfull message.' });
    }
  });   
});


/**
 * Will remove a location from the database
 */
router.delete('/api/remove-beacon/:id', function(req, res) {
});



/**
 * Landing page for locations. Will load all locations in the database.
 */
router.get('/api/get-beacons/data.json', function(req, res) {
  res.json({ "beacons" : beacons });
});


/**
 * Returns an json array of information based on the beacon.
 */
router.get('/api/get-beacon/:id/data.json', function(req, res) {
  //var db = req.db;
  //var collection = db.collection('locationscollection');
  var locationId = req.params.id;

  findById(locationId, function(data) {
    res.json({ "beacon" : data });
  });
});

module.exports = router;
