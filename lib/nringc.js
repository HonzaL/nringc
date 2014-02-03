/**
 * Module dependencies
 */

// ---- ---- ----

var RingCountersController = {}
  , RingCounter = null

module.exports = function(options) {
    RingCounter = require('./models/ringCounter')(options);
    return RingCountersController;
}

RingCountersController.index = function(req, res, next) {
    try {
	var params = req.params;
	var query = req.query;
	RingCounter.index(params, query, function(err, resource) {
	    if(err) return next(err);
	    res.send(resource);
	});
    } catch(err) {
	next(err);
    }
}
