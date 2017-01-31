var mongoose = require('mongoose');

var notificationSchema = mongoose.Schema({
    action:  String,
    seen: Boolean,
    reference: {
	type: mongoose.Schema.Types.ObjectId,
	ref: 'Post'
    },
    submittedUser: {
	type: mongoose.Schema.Types.ObjectId,
	ref: 'User'
    },
    toUser: {
	type: mongoose.Schema.Types.ObjectId,
	ref: 'User'
    },
    created: Date
});

module.exports = mongoose.model('Notification', notificationSchema);
