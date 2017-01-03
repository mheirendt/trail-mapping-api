var mongoose = require('mongoose');

var trailSchema = mongoose.Schema({
    tags:  Array,
    categories: Array,
    submittedUser: {
	type: String,
	ref: 'User'
    },
    reference: {
	type: String,
	ref: 'Post'
    },
    geometry: Array,
    created: Date
});

module.exports = mongoose.model('Trail', trailSchema);
