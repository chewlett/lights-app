var request = require('request');
var Light = require('../models/light');
var config = require('../config/main');

module.exports.toggleLight = function(light) {
	return new Promise(function (fulfill, reject) {
		if (light.type == 'hue') {
			toggleHue(light).then(res => {fulfill(res)});
		}
		else if (light.type == 'wemo') {
			toggleWemo(light).then(res => {fulfill(res)});
		}
	});    
}

function toggleHue(light) {
	return new Promise(function (fulfill, reject) {
		request('http://' + config.hueIP + '/api/' + config.hueKey + '/lights/' + light.number, 
		(err, res, body) => {
			if (res.statusCode == 200) {
				try {
					let info = JSON.parse(body);
					if (info.state.on) {
						hueOff(light).then(function (res) {
							fulfill(res);
						});
					}
					else {
						hueOn(light).then(function (res) {
							fulfill(res);
						});
					}
				}
				catch (e) {
					console.log("can't parse" + e)			
				}
			}
		});
	});
}

function hueOn(light) {
	return new Promise(function (fulfill, reject) {
		request({
			url: 'http://' + config.hueIP + '/api/' + config.hueKey + '/lights/'+light.number+'/state',
			method: 'PUT',
			json: {"on": true}
		}, (err, res, body) => {
			if (err) {
				reject(err);
			}
			else { fulfill(body)}
		}); 
	});
}
function hueOff(light) {
	return new Promise(function (fulfill, reqject) {
		request({
			url: 'http://' + config.hueIP + '/api/' + config.hueKey + '/lights/'+light.number+'/state',
			method: 'PUT',
			json: {"on": false}
		}, (err, res, body) => {
			if (err) {
				reject(err);
			}
			else { fulfill(body)}
		});
	});
}
