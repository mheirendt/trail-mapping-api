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

module.exports.markAsRead = function(req, res) {
    var notificationId = req.body.notificationId;
    Notification.findOne({_id : notificationId }, function (error, notification) {
	if (error)
	    return res.status(400).end("Could not find notification: " + notificationId + "\n Error: " + JSON.stringify(error));
	notification.read = true;
	notification.save(function(err, saved) {
	    if (err)
		return res.status(400).end("Could not save notification: " + notificationId + "\n Error: " + JSON.stringify(err));
	    return res.status(200).end(JSON.stringify(notification));
	});
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
