var mongoose = require('mongoose')

var LightSchema = mongoose.Schema({
    lightName: {
        type: String,
        index: true
    },
    type: {
        type: String
    },
    address: {
        type: String
    },
    number: {
        type: Number
    }
})

var Light = module.exports = mongoose.model('Light', LightSchema);

module.exports.getLightByName = function(name, callback) {
    Light.findOne({lightName: name}, callback);
}

module.exports.getLightById = function(id, callback) {
    Light.findById(id, callback);
}

module.exports.getAllLights = function(callback) {
    Light.find(callback)
}