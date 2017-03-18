var express = require('express')
var path = require('path');
var request = require('request')
var config = require('./config/main')
var mongoose = require('mongoose');
mongoose.connect(config.database);
var Light = require('./models/light');
var lightService = require('./services/lightsService');

var app = express()
app.set('port', config.port);

app.use(express.static(path.join(__dirname, 'client')));

app.get('/', (req, res, next) => {
    res.render('index.html')
})

app.listen(app.get("port"), function() {
    console.log("Server started on port: " + app.get("port"));
    Light.getAllLights(function(err, lights) {
        console.log(lights);
        lightService.toggleLight(lights[0]);
    })
    
});

