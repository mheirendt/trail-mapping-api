var mongoose = require('mongoose');
var GeoJSON = require('mongoose-geojson-schema');

var trailSchema = mongoose.Schema({
    tags:  Array,
    categories: Array,
    submittedUser: {
	type: String,
	ref: 'User'
    },
    geometry: mongoose.Schema.Types.LineString,
    created: Date
});

module.exports = mongoose.model('Trail', trailSchema);
