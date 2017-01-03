var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    body: String,
    reference: {
	ref: 'Trail',
    },
    submittedUser: {
	ref: 'User'
    },
    likes: Number,
    comments: Array,
    created: Date
});

module.exports = mongoose.model('Post', postSchema);
    
