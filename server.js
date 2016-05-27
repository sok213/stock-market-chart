var express = require('express'),
	app = express(),
	http = require('http');

var port = 5000;
app.listen(port, function(err) {
    console.log('running server on port ' + port);
});

app.use(express.static('./'));
