var request = require('request');
var Light = require('../models/light');
var config = require('../config/main');

module.exports.toggleLight = function(light) {
    if (light.type == 'hue') {
        toggleHue(light);
    }
    else if (light.type == 'wemo') {
        toggleWemo(light);
    }
}

function toggleHue(light) {
    request({
        // url: 'http://' + config.hueIP + '/api/' + config.hueKey + '/lights',
        url: 'http://www.google.com',
        method: 'GET'        
    })
    // .on('error', (error) => {
    // console.log(error)
    // })
    .on("response", (response) => {
        //   if (JSON.parse(response).state.on == true) {
        //       hueOff(light);
        //   }
        //   else {
        //       hueOn(light);
        //   }
        console.log(response);
    })  

}

function hueOn(light) {
    request({
        url: 'http://' + config.hueIP + '/api/' + config.hueKey + '/lights/'+light.number+'/state',
        method: 'PUT',
        json: {"on": true}
    })
    .on('error', (error) => {
        console.log(error)
    })
    .on("response", (response) => {
        console.log(response)
    })  
}
function hueOff(light) {
    request({
        url: 'http://' + config.hueIP + '/api/' + config.hueKey + '/lights/'+light.number+'/state',
        method: 'PUT',
        json: {"on": false}
    })
    .on('error', (error) => {
        console.log(error)
    })
    .on("response", (response) => {
        console.log(response)
    })  
}