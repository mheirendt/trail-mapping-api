var mongoose = require('mongoose');

var trailSchema = mongoose.Schema({
    tags:  Array,
    categories: Array,
    submittedUser: {
	type: mongoose.Schema.Types.ObjectId,
	ref: 'User'
    },
    reference: {
	type: mongoose.Schema.Types.ObjectId,
	ref: 'Post'
    },
    geometry: Array,
    created: Date
});

module.exports = mongoose.model('Trail', trailSchema);
