var mongoose = require('mongoose');
var GeoJSON = require('mongoose-geojson-schema');

var trailSchema = mongoose.Schema({
    tags:  array,
    categories: array,
    submittedUser: {
	type: String,
	ref: 'User'
    },
    Geometry: mongoose.Schema.Types.LineString,
    created: Date
});

module.exports = mongoose.model('Trail', trailSchema);
