var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	storage = require('node-persist'),
	storedStocks = [];

var port = process.env.PORT || 5000;

storage.initSync();
storage.setItem('storedStocks', []);
storage.setItem('time', 366);

io.on('connection', function(socket) {
	console.log("User has connected");

	//On every new connection, render the chart and stock list menus.
	socket.emit('render chart', storage.getItem('storedStocks'), storage.getItem('time'));
	socket.emit('add stocks to side menu', storage.getItem('storedStocks'));

	//Takes user input and stores the symbol to storedStocks
	socket.on('store symbol to node', function(symbol) {
		var storedStocks = storage.getItem('storedStocks');
		storedStocks.push(symbol);
		storage.setItem('storedStocks', storedStocks);
		console.log('storedStocks: ' + storage.getItem('storedStocks'));
		io.emit('render chart', storage.getItem('storedStocks'), storage.getItem('time'));
		io.emit('add stocks to side menu', storage.getItem('storedStocks'));
	});

	socket.on('store time', function(timeFrame) {
		storage.setItem('time', timeFrame);
		io.emit('render chart', storage.getItem('storedStocks'), storage.getItem('time'));
	});

	//Delete a stock item from the side-menu and chart.
	socket.on('delete stock item', function(stock) {
		storedStocks = storage.getItem('storedStocks');
		storedStocks.splice(storedStocks.indexOf(stock), 1);
		console.log('deleted: '+stock+' from storedStocks: '
					+ storedStocks);
		storage.setItem('storedStocks', storedStocks);
		io.emit('delete a stock from side-menu', storedStocks);
		io.emit('render chart', storage.getItem('storedStocks'), storage.getItem('time'));
	});

	socket.on('clear', function() {
		storage.setItem('storedStocks', []);
		io.emit('clear');
	});
});

app.use(express.static('./'));

http.listen(port, function(){
  console.log('listening on *:' + port);
});