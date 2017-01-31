var Notification = require('../models/notification');
var User = require('../models/user');
var Post = require('../models/post');

module.exports = {};

module.exports.create = function(req, res) {
    var newNotification = new Notification();
    newNotification.action = req.body.action;
    newNotification.seen = false;
    newNotification.submittedUser = null;
    newNotification.toUser = req.body.toUser;
    newNotification.created = new Date();

    newNotification.save(function(error, post) {
	if (error)
	    res.status(400).end('Could not create notification: ' + JSON.stringify(error));
	res.writeHead(200, {"Content-Type": "application/json"});
	newNotification = newTrail.toObject();
	res.end(JSON.stringify(newNotification));
    });
}

module.exports.delete = function(req, res) {
    var notificationId = req.body.id;
    Notification.remove({_id: notificationId}, function(err) {
	if (err)
	    return res.status(400).end("Could not delete notification " + notificationId);
        res.status(200).end('Deleted');
    });
}
