var express = require('express');
var router = express.Router();

/* For now, to build the UI */

/* GET session page. */
router.get('/', function(req, res, next) {
    res.render('session', {
        title: 'Remotronome Session',

        shareURL: 'https://' + req.get('host') + req.originalUrl,
        /* All of this just for now, to build the UI */
        synchronizedNumber: 2,
        connectedNumber: 2
    });
});

module.exports = router;
