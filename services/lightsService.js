var request = require('request');
var Light = require('../models/light');
var config = require('../config/main');

var postbodyheader = [
  '<?xml version="1.0" encoding="utf-8"?>',
  '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">',
    '<s:Body>'].join('\n');

var postbodyfooter = ['</s:Body>',
  '</s:Envelope>'
].join('\n');

var getStateBody = [
  '<u:GetBinaryState xmlns:u="urn:Belkin:service:basicevent:1">',
  '</u:GetBinaryState>'
].join('\n');

var setStateBodyOn = [
    '<u:SetBinaryState xmlns:u="urn:Belkin:service:basicevent:1">',
        '<BinaryState>1</BinaryState>',
    '</u:SetBinaryState>',
].join('\n');

var setStateBodyOff = [
    '<u:SetBinaryState xmlns:u="urn:Belkin:service:basicevent:1">',
        '<BinaryState>0</BinaryState>',
    '</u:SetBinaryState>',
].join('\n');

module.exports.toggleLight = function(light) {
	return new Promise(function (fulfill, reject) {
		if (light.type == 'hue') {
			toggleHue(light)
				.then(res => {fulfill(res)})
				.catch(err => {reject(err)});
		}
		else if (light.type == 'wemo') {
			toggleWemo(light)
				.then(res => {fulfill(res)})
				.catch(err => {reject(res)});
		}
	});    
}

module.exports.updateLightStates = function() {
	return new Promise(function(fulfill, reject) {
		let allLights = null;
		Light.getAllLights(function(err, lights) {
			if (err) {
				reject(err);
			}
			else {
				allLights = lights;
				// let promiseArray = [];
				// for (let i = 0; i < allLights.length; i++) {
				// 	let p = new Promise((fulfill, reject) => {
				// 		fulfill(getLightState(allLights[i]));
				// 	})
						
				// 		// .then(data => {
				// 		// 		Light.updateLightState(data.id, data.state, function(err, res) {
				// 		// 			if (err) {
				// 		// 				reject(err);
				// 		// 			} else {										
				// 		// 				fulfill(res);
				// 		// 			}								
				// 		// 		});
				// 		// 	}).catch(err => {
				// 		// 		console.log("Caught in get state: " + err);
				// 		// 		reject(err);
				// 		// 	});
				// 	promiseArray.push(p);
				// }

				// Promise.all(promiseArray)
				// 	.then((responses) => {
				// 		// for (let i = 0; i < responses.length; i++) {
				// 		// 	console.log(responses[i]);
				// 		// }
				// 		console.log(responses);
				// 		fulfill('done');
				// 	}).catch((err) => {
				// 		console.log(err);
				// 		reject('error updating states');						
				// 	})

				// ((lights) => {
				// 	return new Promise(function(fulfill, reject) {
				// 		console.log('starting update')
				// 		for (let i = 0; i < lights.length; i++) {
				// 			getLightState(lights[i])
				// 				.then(data => {
				// 					Light.updateLightState(data.id, data.state, function(err, res) {
				// 						if (err) {
				// 							console.log(err);
				// 						} else {
				// 							console.log(res);
				// 						}								
				// 					});
				// 				}).catch(err => {
				// 					console.log("Caught in get state: " + err);
				// 				});
				// 		}
				// 	})				
				// })(allLights).then(function() {
				// 	console.log('States Updated');
				// 	fulfill('done');
				// }).catch(() => {
				// 	reject('error updating states');
				// });

				allLights.reduce((seq, n) => {
					return seq.then(() => {
						return getLightState(n)
							.then(data => {
								Light.updateLightState(data.id, data.state, function(err, res) {
									if (err) {
										console.log(err);
									} else {
										console.log(res);
									}								
								});
							}).catch(err => {
								console.log("Caught in get state:" + err);
							});
					});
				}, Promise.resolve())
				.then(() => {
					console.log('States Updated');
					fulfill('done');
				})
				.catch(() => {
					reject('error updating states');
				});
		}    
    });
	})
}

function getLightState(light) {
	return new Promise(function (fulfill, reject) {
		if (light.type == 'hue') {
			request('http://' + config.hueIP + '/api/' + config.hueKey + '/lights/' + light.number, 
				(err, res, body) => {
					if (err) {
						reject(err);
					}
					else  {
						let info = JSON.parse(body);
						if (info.state.on) {
							fulfill({ 
								'id': light._id,
								'state': true
							});
						}
						else {
							fulfill({ 
								'id': light._id,
								'state': false
							});
						}
					}										
				});
		}
		else if (light.type == 'wemo') {
			request({
				url: light.address + '/upnp/control/basicevent1',
				method: 'POST',
				headers: {
					'SOAPACTION': '"urn:Belkin:service:basicevent:1#GetBinaryState"',
					'Content-Type': 'text/xml; charset="utf-8"',
					'Accept': ''
				},
				body: postbodyheader + getStateBody + postbodyfooter
			}, (err, res, body) => {
				if (err) {
					reject(err);
				}
				else {
					let state = body.substring((body.indexOf('<BinaryState>') + 13), (body.indexOf('<BinaryState>') + 14));
					if (state == 1) {
						fulfill({ 
								'id': light._id,
								'state': true
							});
					}
					else {
						fulfill({ 
								'id': light._id,
								'state': false
							});
					}
				}				
			});
		}
	})
}

function toggleHue(light) {
	return new Promise(function (fulfill, reject) {
		request('http://' + config.hueIP + '/api/' + config.hueKey + '/lights/' + light.number, 
		(err, res, body) => {
			if (err) {
				reject(err);
			}
			else {
				if (res.statusCode == 200) {
					try {
						let on = false;
						let info = JSON.parse(body);
						if (!info.state.on) {
							on = true;
						}
						request({
								url: 'http://' + config.hueIP + '/api/' + config.hueKey + '/lights/'+light.number+'/state',
								method: 'PUT',
								json: {"on": on}
							}, (err, res, body) => {
								if (err) {
									reject(err);
								}
								else { fulfill(body)}
							});
					}
					catch (e) {
						console.log("can't parse" + e)			
					}
				}
			}			
		});
	});
}

function toggleWemo(light) {
	return new Promise(function (fulfill, reject) {
		request({
			url: light.address + '/upnp/control/basicevent1',
			method: 'POST',
            headers: {
                'SOAPACTION': '"urn:Belkin:service:basicevent:1#GetBinaryState"',
                'Content-Type': 'text/xml; charset="utf-8"',
                'Accept': ''
            },
			body: postbodyheader + getStateBody + postbodyfooter
		}, (err, res, body) => {
			if (err) {
				reject(err);
			}
			else { 		
				let state = body.substring((body.indexOf('<BinaryState>') + 13), (body.indexOf('<BinaryState>') + 14))				
				let stateBody = setStateBodyOn;
				if (state == 1) {					
					stateBody = setStateBodyOff;
				}
				request({
					url: light.address + '/upnp/control/basicevent1',
					method: 'POST',
					headers: {
						'SOAPACTION': '"urn:Belkin:service:basicevent:1#SetBinaryState"',
						'Content-Type': 'text/xml; charset="utf-8"',
						'Accept': ''
					},
					body: postbodyheader + stateBody + postbodyfooter
				}, (err, res, body) => {
					if (err) {
						reject(err);
					}
					else { 						
						fulfill(body);
					}
				}); 
			}
		}); 
	});
}

function getHueState(light) {
	return new Promise((fulfill, reject) => {

	});	
}
function getWemoState(light) {
	return new Promise((fulfill, reject) => {

	});	
}
function setHueOn(light) {
	return new Promise((fulfill, reject) => {

	});	
}
function setHueOff(light) {
	return new Promise((fulfill, reject) => {

	});	
}
function setWemoOn(light) {
	return new Promise((fulfill, reject) => {

	});	
}
function setWemoOff(light) {
	return new Promise((fulfill, reject) => {

	});	
}
