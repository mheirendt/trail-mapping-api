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
    comments: Number,/*
    comments: [{
	body: String,
	likes : [{
	    type : mongoose.Schema.Types.ObjectId,
	    ref: 'User'
	}],
	replies : [{
	    body: String,
	    likes : [{
		type : mongoose.Schema.Types.ObjectId,
		ref: 'User'
	    }],
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
    }],*/
    created: {
	type: Date,
	index: true
    }
});
postSchema.index({ name: 1, type: -1 });
module.exports = mongoose.model('Post', postSchema);
    
