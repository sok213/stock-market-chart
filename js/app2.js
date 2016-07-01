$(function () {

    var seriesOptions = [],
        plotLineColors = [],
        socket = io(),
        timeFrame = 366,
        currentStock = [],
        currentSeries,
        colors = [  "Bisque",
                    "Black",
                    "Blue",
                    "BlueViolet",
                    "Brown",
                    "BurlyWood",
                    "CadetBlue",
                    "Chartreuse",
                    "Chocolate",
                    "Coral",
                    "CornflowerBlue",
                    "Crimson",
                    "Cyan",
                    "DarkBlue",
                    "DarkCyan",
                    "DarkGoldenRod",
                    "DarkGreen",
                    "DarkKhaki",
                    "DarkMagenta",
                    "DarkOliveGreen",
                    "Darkorange",
                    "DarkOrchid",
                    "DarkRed",
                    "DarkSalmon",
                    "DarkSeaGreen",
                    "DarkSlateBlue",
                    "DarkTurquoise",
                    "DarkViolet",
                    "DeepPink",
                    "DeepSkyBlue",
                    "DodgerBlue",
                    "FireBrick",
                    "ForestGreen",
                    "Fuchsia",
                    "Gold",
                    "GoldenRod",
                    "Green",
                    "GreenYellow",
                    "HotPink",
                    "IndianRed",
                    "Indigo",
                    "Khaki",
                    "Lavender",
                    "LawnGreen",
                    "Lime",
                    "LimeGreen",
                    "Magenta",
                    "Maroon",
                    "MediumAquaMarine",
                    "MediumBlue",
                    "MediumOrchid",
                    "MediumPurple",
                    "MediumSeaGreen",
                    "MediumSlateBlue",
                    "MediumSpringGreen",
                    "MediumTurquoise",
                    "MediumVioletRed",
                    "MidnightBlue",
                    "MistyRose",
                    "Moccasin",
                    "Navy",
                    "Olive",
                    "OliveDrab",
                    "Orange",
                    "OrangeRed",
                    "Orchid",
                    "PaleGoldenRod",
                    "PaleGreen",
                    "PaleTurquoise",
                    "PaleVioletRed",
                    "PeachPuff",
                    "Peru",
                    "Pink",
                    "Plum",
                    "PowderBlue",
                    "Purple",
                    "Red",
                    "RosyBrown",
                    "RoyalBlue",
                    "SaddleBrown",
                    "Salmon",
                    "SandyBrown",
                    "SeaGreen",
                    "SkyBlue",
                    "SlateBlue",
                    "SpringGreen",
                    "SteelBlue",
                    "Tomato",
                    "Turquoise",
                    "Violet",
                    "YellowGreen"
                    ];

    //Function to create the object required to pass into 
    //the render function.
    function seriesObject(ohlc, symbol, color) {
        this.type = 'spline',
        this.name = symbol, 
        this.data = ohlc,
        this.color = color
    };

//---------------------------------------------------------------------------------------
//  React side-menu and buttons code below.

    
    //Button that toggles the side menu on and off.
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        $(".list-btn").html($('.list-btn').text() == 'Hide stock list' ? 'Show stock list' : 'Hide stock list');
    });

    var chart = {};

    socket.on('render chart', function(stocks) {
        console.log('SEE THIS')
        var excludeDuplicates = [];
        stocks.filter(function(stock) {
            if(excludeDuplicates.indexOf(stock) == -1) {
                excludeDuplicates.push(stock);
            }
        });

        excludeDuplicates.filter(function(stock) {
            console.log('Running through ajax: '+stock)
            quandlCall(stock);
        });
    });

    //Make an Ajax call to the Quandl API.
    function quandlCall(input) {
        seriesOptions = [];
        $.ajax({
            type: 'GET',
            url: 'https://www.quandl.com/api/v3/datasets/WIKI/'+input+'.json?api_key=V4BCHbABAxxzqfHo-miH&start_date=2016-01-01&end_date=2016-03-06',
            dataType: 'json',
            contentType: 'text/plain',
            xhrFields: {
                    withCredentials: false
            },
            success: function(data) {
                if(!data) {
                    console.error('Error: ', data.message);
                }
                var currentColor = colors[Math.floor((Math.random() * (colors.length-1)) + 0)];
                currentSeries = new seriesObject(data.dataset.data.reverse(), input, currentColor);
                seriesOptions.push(currentSeries);
                renderChart();
            },
            error: function(response, txtStatus) {
                console.log(response, txtStatus);
            }
        });
    }

    //Render chart using HighCharts API.
    function renderChart() {
        //set the Highcharts date format for use.
        Highcharts.dateFormat("Month: %m Day: %d Year: %Y", 20, false);
        // create the chart
        chart = new Highcharts.Chart({
            chart: {
                renderTo: 'chartContainer',
                marginLeft: 50
            },
            title: { text: 'Historical Price' },
            marginBottom: 100,
            yAxis: {
                opposite: false,
            
                title: {
                    text: ''
                },
                labels: {
                    formatter: function () {
                        return (this.value > 0 ? ' + ' : '') + this.value + '%';
                    }
                },
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: 'silver'
                }]
            },
            plotOptions: {
                series: { compare: 'percent' }
            },
            xAxis: {
                type: 'datetime',
                tickInterval: 7 * 24 * 36e5, // one week
                labels: {
                    format: '{value: %m/%d/%Y}',
                    align: 'right',
                    rotation: -30
                }
            },
            tooltip: { valueDecimals: 2 },
            //takes in the stock data and charts it.
            series: seriesOptions,
            exporting: { enabled: false },
            credits: { enabled:false }
        });
    }

    var validateUserInput = function(input) {
        //Filter for form submission to prevent invalid 
        //stock symbols or pre-existing symbols within the list.
        if(currentStock.indexOf(input) == -1) {
            //pushes the value of from submission to the currentStock array.
            currentStock.push(input);
            socket.emit('store symbol to node', input);
            document.getElementById('stockname').value = '';
            $('#invalid').css('visibility', 'hidden');
        } else {
            $('#invalid').html(input + " has already been added.")
            $('#invalid').css('visibility', 'visible');
        }

        //disables input field upon submission for one second
        //to prevent submission abuse.
        document.getElementById('stockname').disabled = true;

        setTimeout(function() {
            document.getElementById('stockname').disabled = false;
        }, 1000);
    }
    
    $('#addStock').click(function(e) {
        e.preventDefault();
        //ajax call to check if symbol exists.
        var userInput = $('form').serializeArray()[0].value.toUpperCase().replace(/\s/g, '');
        $.ajax({
            type: 'GET',
            url: 'https://www.quandl.com/api/v3/datasets/WIKI/'+userInput+'.json?api_key=V4BCHbABAxxzqfHo-miH&start_date=2016-01-01&end_date=2016-03-06',
            dataType: 'json',
            contentType: 'text/plain',
            success: function(data) {
                if(!data) {
                    console.error('Error: ', data.message);
                }
                validateUserInput(userInput);
            },
            error: function(response, txtStatus) {
                console.log(response, txtStatus);
                $('#invalid').html(userInput + " does not exist within the database.")
                $('#invalid').css('visibility', 'visible');
            }
        });
    });

    $('#clearChart').click(function() {
        socket.emit('clear');
    });

    socket.on('add stocks to side menu', function(arr) {
        //retrieves array from storage in server.js file.
        //pushes the array into currentStock

        if(Array.isArray(arr)) {
            //Push all stocks from arr into currentStock
            arr.filter(function(x) {
                //Only push stock if it is not already inside 
                //currentStock array.
                if(currentStock.indexOf(x) == -1) {
                    currentStock.push(x);
                }
            });
            
            socket.emit('store stock list', currentStock);
        }

        console.log('This is currentStock: '+arr)
        ReactDOM.render( <SideBarList bankOfStocks={currentStock}/>, document.getElementById('sidebar'));
        ReactDOM.render( <SideBarList bankOfStocks={currentStock}/>, document.getElementById('sidebar2'));
    });

    socket.on('delete a stock from side-menu', function(arr) {
        $('.list-item').remove();
        seriesOptions = [];
        currentStock = arr;
        ReactDOM.render( <SideBarList bankOfStocks={currentStock}/>, document.getElementById('sidebar'));
        ReactDOM.render( <SideBarList bankOfStocks={currentStock}/>, document.getElementById('sidebar2'));
    });

    socket.on('clear', function() {
        currentStock = [];
        if(chart.series) {
            chart.series.filter(function(data) {
                data.setData([]);
            });
        }
        $('.list-item').remove();
        $('#chartContainer').empty();
        ReactDOM.render( <SideBarList bankOfStocks={currentStock}/>, document.getElementById('sidebar'));
        ReactDOM.render( <SideBarList bankOfStocks={currentStock}/>, document.getElementById('sidebar2'));
    });

    //Define React SideBarList Class
    var SideBarList = React.createClass({
        getInitialState: function() {
            return {
                stockList: { stockTick: [{symbol: this.props.bankOfStocks}]}
            }
        },

        deleteItem: function(i) {
            //disables input field upon submission for one second
            //to prevent submission abuse.
            document.getElementsByClassName('delete-btn').disabled = true;

            
            var x = this.state.stockList.stockTick[0].symbol[i];
            currentStock.splice(currentStock.indexOf(x), 1);
            console.log("CURRENTSTOCK.LENGTH: "+currentStock.length)
            if(currentStock.length == 0) {
                console.log('VALID')
                socket.emit('clear');
            } else {
                this.setState({stockList: { stockTick: [{symbol: this.props.bankOfStocks}]}});
                seriesOptions = [];
                socket.emit('delete stock item', x);
            }
        },

        render: function() {
            console.log('BANK OF STOCKS: '+JSON.stringify(this.state.stockList));
            var deleteItem = this.deleteItem;
            var stockList = this.state.stockList.stockTick[0].symbol;
            var createStockList = function(stock, i) {
                //Randomly generates a number for unqiue key for each li element
                var key = Math.floor((Math.random() * 9999) + 0);
                return <li key={key} id={stock}><button className="delete-btn" onClick={deleteItem.bind(this, i, stockList)}><div className="icon-margin"><i className="fa fa-times-circle" aria-hidden="true"></i></div></button><a className="stockItem" href="#">{stock}</a></li>;
            };
            return <ul className="list-item">{this.state.stockList.stockTick[0].symbol.map(createStockList)}</ul>;
        }
    });

    $('.1m').click(function() {
        if(currentStock.length > 0){
            timeFrame = 30;
            $('.1m').css('border-color', '#ffc656');

            $('.3m').css('border-color', '#f2f2f2');
            $('.6m').css('border-color', '#f2f2f2');
            $('.1y').css('border-color', '#f2f2f2');
        }
    });

    $('.3m').click(function() {
        if(currentStock.length > 0){
            timeFrame = 90;
            $('.3m').css('border-color', '#ffc656');

            $('.1m').css('border-color', '#f2f2f2');
            $('.6m').css('border-color', '#f2f2f2');
            $('.1y').css('border-color', '#f2f2f2');
        }
    });

    $('.6m').click(function() {
        if(currentStock.length > 0){
            timeFrame = 183;
            $('.6m').css('border-color', '#ffc656');

            $('.3m').css('border-color', '#f2f2f2');
            $('.1m').css('border-color', '#f2f2f2');
            $('.1y').css('border-color', '#f2f2f2');
        }
    });

    $('.1y').click(function() {
        if(currentStock.length > 0){
            timeFrame = 366;
            $('.1y').css('border-color', '#ffc656');

            $('.3m').css('border-color', '#f2f2f2');
            $('.6m').css('border-color', '#f2f2f2');
            $('.1m').css('border-color', '#f2f2f2');
        }
    });

});

