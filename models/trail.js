var mongoose = require('mongoose');

var trailSchema = mongoose.Schema({
    tags:  Array,
    categories: Array,
    submittedUser: {
	ref: 'User'
    },
    geometry: Array,
    created: Date
});

module.exports = mongoose.model('Trail', trailSchema);
