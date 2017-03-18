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
    request('http://' + config.hueIP + '/api/' + config.hueKey + '/lights/' + light.number, 
	(err, res, body) => {
		if (res.statusCode == 200) {
			console.log("toggling")
			try {
				let info = JSON.parse(body);
				console.log(info.state.on)
				if (info.state.on) {
					hueOff(light);
				}
				else {
					hueOn(light);
				}
			}
			catch (e) {
				console.log("can't parse" + e)			
			}
		}
    });
}

function hueOn(light) {
    request({
        url: 'http://' + config.hueIP + '/api/' + config.hueKey + '/lights/'+light.number+'/state',
        method: 'PUT',
        json: {"on": true}
    }, (err, res, body) => {
		console.log(body);
	});  
}
function hueOff(light) {
    request({
        url: 'http://' + config.hueIP + '/api/' + config.hueKey + '/lights/'+light.number+'/state',
        method: 'PUT',
        json: {"on": false}
    }, (err, res, body) => {
		console.log(body);
	}) 
}
