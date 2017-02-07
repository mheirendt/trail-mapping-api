var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
    body: String,
    postId: {
	type: mongoose.Schema.Types.ObjectId,
	ref: 'Post'
    },
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
});

commentSchema.index({ name: 1, type: -1 });
module.exports = mongoose.model('Comment', commentSchema);
