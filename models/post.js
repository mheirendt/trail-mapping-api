var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    body: String,
    reference: {
	type: mongoose.Schema.Types.ObjectId,
	ref: 'Trail',
    },
    submittedUser: {
	type: mongoose.Schema.Types.ObjectId,
	ref: 'User'
    },
    likes: Number,
    comments: Array,
    created: Date
});

module.exports = mongoose.model('Post', postSchema);
    
