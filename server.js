var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	storage = require('node-persist'),
	storedStocks = [];

var port = process.env.PORT || 5000;

storage.initSync();
storage.setItem('stockList', []);
storage.setItem('timelapse', 366);


io.on('connection', function(socket) {
	console.log("User has connected");
	storedStocks = storage.getItem('stockList');
	
	storedStocks.filter(function(x) {
		socket.emit('store stock list', x);
	});

	console.log('TIMELAPSE: '+storage.getItem('timelapse'))
	socket.emit('render chart', storedStocks, storage.getItem('timelapse'));

	socket.emit('add stocks to side menu', storedStocks);

//define socket functions
//------------------------------------------------------------------	

	socket.on('render chart', function(x, y) {
		io.emit('add stocks to side menu', x[x.length-1]);
		storage.setItem('timelapse', y);
		var filteredX = [];
		x.filter(function(item) {
			if(filteredX.indexOf(item) == -1) {
				filteredX.push(item);
			}
		});

		console.log('rendering X to render chart:' +filteredX);
		io.emit('render chart', filteredX, y);
	});

	//socket.on('add stocks to side menu', function(arr) {
     //   io.emit('add stocks to side menu', arr);
    //});

    socket.on('store stock list', function(stock) {
    	//stock is a cursor to items in storedStocks. 
    	//or currentStock
		if(Array.isArray(stock)) {
			stock2 = [];
			storedStocks.filter(function(x) {
				//this is where duplicated get added.
				stock2.push(x);
			});
		} else {
			storedStocks.push(stock);
		}

		//Storing items in storedStocks to stockList.
		storage.setItem('stockList', storedStocks);
		console.log('setting stockList to: '+ storedStocks);
		io.emit('store stock list', stock);
	});



	socket.on('delete stock item', function(stock) {
		storedStocks.splice(storedStocks.indexOf(stock), 1);
		console.log('deleted: '+stock+'storedStocks: '
					+ storedStocks);
		storage.setItem('stockList', storedStocks);
		io.emit('delete a stock from side-menu', storedStocks);
	});

	socket.on('empty list', function() {
		storedStocks = [];
		storage.setItem('stockList', storedStocks);
		io.emit('empty list');
	});

	socket.on('clear', function() {
		io.emit('clear');
	});
});

app.use(express.static('./'));

http.listen(port, function(){
  console.log('listening on *:' + port);
});