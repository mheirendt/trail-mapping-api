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
    likes: [{
	type : mongoose.Schema.Types.ObjectId,
	ref: 'User'
    }],
    comments: [{
	body: String,
	replies : [{
	    body: String,
	    submittedUser: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	    },
	    created: Date
	}],
	submittedUser: {
	    type : mongoose.Schema.Types.ObjectId,
	    ref: 'User'
	},
	created: Date
    }],
    created: Date
});

module.exports = mongoose.model('Post', postSchema);
    
