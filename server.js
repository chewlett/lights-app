var express = require('express')
var path = require('path');
var request = require('request')
var config = require('./config/main')
var mongoose = require('mongoose');
mongoose.connect(config.database);
var Light = require('./models/light');
var lightService = require('./services/lightsService');
var upnp = require('./services/upnpService');
var convertXml = require('xml-js');

var app = express()

var viewEngine = require('ejs-locals');
app.engine('ejs', viewEngine);
app.set('view engine', 'ejs');

app.set('port', config.port);

app.use(express.static(path.join(__dirname, 'client')));

app.get('/', (req, res, next) => {
    let allLights = null;
    lightService.updateLightStates()
        .then(() => {
            Light.getAllLights(function(err, lights) {
                allLights = lights;
                res.render('index', {
                            title : "All Lights",
                            data: allLights
                        });
            });
        })
        .catch(err => {
            Light.getAllLights(function(err, lights) {
                allLights = lights;
                res.render('index', {
                            title : "All Lights",
                            data: allLights
                        });
            });
        });
})
app.get('/toggle/:id', function(req, res, next) {
    let id = req.params.id;
    Light.getLightById(id, function(err, light) {
        if (err) {
            res.send(err);
        }
        lightService.toggleLight(light)
            .then(response => {
                res.send(response);
            })
            .catch(err => {
                res.send(err);
            })
    });
})
app.get('/lights', function(req, res, next) {
    // res.send('test test');
    let allLights = null;
    lightService.updateLightStates()
        .then(response => {
            Light.getAllLights(function(err, lights) {
                res.send(lights);
            });            
        }) 
        .catch(err => {
            res.send(err);
        });
})



app.listen(app.get("port"), function() {
    console.log("Server started on port: " + app.get("port"));
    upnp.createSocket();
});
