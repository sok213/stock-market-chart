var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	port = 5000,
	storage = require('node-persist'),
	storedStocks = [];

storage.initSync();
storage.setItem('stockList', ['AMZN', 'GOOG', 'AMD', 'INTC']);


io.on('connection', function(socket) {
	console.log("User has connected");
	storedStocks = storage.getItem('stockList');
	
	storedStocks.filter(function(x) {
		socket.emit('store stock list', x);
	});


	socket.emit('render chart', storedStocks);

	socket.emit('add stocks to side menu', storedStocks);

//define socket functions
//------------------------------------------------------------------	

	socket.on('render chart', function(x) {
		//x DOES NOT INCLUDE SUBMISSIONS FROM ALL SOCKETS.
		//CLIENT SUBMISSIONS ARE SEPARATED AND SIDE MENU LIST
		//DOES NOT GET UPDATED UNTIL STOREDSTOCKS GET
		//RENDERED ON SOCKET REFRESH.

		//SOLUTION: before calling this render chart function, 
		//bring in currentStocks to this file and update it
		//with the items within stockList.
		console.log('rendering chart with: '+x)
		console.log('adding: '+x[x.length-1]+' to "add stocks to side menu"')
		io.emit('add stocks to side menu', x[x.length-1]);
		io.emit('render chart', x);
	});

	//socket.on('add stocks to side menu', function(arr) {
     //   io.emit('add stocks to side menu', arr);
    //});

    socket.on('store stock list', function(stock) {
    	//stock is a cursor to items in storedStocks. 
    	//or currentStock
    	
		if(Array.isArray(stock)) {
			//storedStocks = [];
			console.log('pushing array of storedStocks: '+
						storedStocks+' to currentStocks: '+ stock);
			storedStocks.filter(function(x) {
				//this is where duplicated get added.
				stock.push(x);
			});

		} else {
			//this code never runs. remove.
			console.log('pushing currentStock '+
						stock + ' to storedStocks: '+ storedStocks);
			storedStocks.push(stock);
		}

		//Storing items in storedStocks to stockList.
		storage.setItem('stockList', storedStocks);
		console.log('setting stockList to: '+ storedStocks);
	});
});

app.use(express.static('./'));

http.listen(port, function(){
  console.log('listening on *:' + port);
});