$(function () {

    var seriesOptions = [],
        plotLineColors = [],
        socket = io(),
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

    socket.on('new connection', function() {
        $('.list-item').remove();
    });

    function seriesObject(ohlc, symbol, color) {
        this.type = 'spline',
        this.name = symbol, 
        this.data = ohlc,
        this.color = color
    };

    var currentStock = [];

    //this is what causes array to be blank in some cases?
    socket.emit('store stock list', currentStock);
//---------------------------------------------------------------------------------------
//  React side-menu and buttons code below.

    var timeFrame = 366;
    
    //Button that toggles the side menu on and off.
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        $(".list-btn").html($('.list-btn').text() == 'Hide stock list' ? 'Show stock list' : 'Hide stock list');
    });

    socket.on('render chart', function(stocks, time) {
        seriesOptions=[];
        /*stocks.filter(function(stock) {
            newChart = new Markit.InteractiveChartApi(stock, time);
        });*/

        //checks to see which time frame is activated on the chart.
        //Changes the activated one to have an orange outline.
        if(time == 30) {
            $('.1m').css('border-color', '#ffc656');

            $('.3m').css('border-color', '#f2f2f2');
            $('.6m').css('border-color', '#f2f2f2');
            $('.1y').css('border-color', '#f2f2f2');
        } else if(time == 90) {
            $('.3m').css('border-color', '#ffc656');

            $('.1m').css('border-color', '#f2f2f2');
            $('.6m').css('border-color', '#f2f2f2');
            $('.1y').css('border-color', '#f2f2f2');
        } else if(time == 183) {
            $('.6m').css('border-color', '#ffc656');

            $('.3m').css('border-color', '#f2f2f2');
            $('.1m').css('border-color', '#f2f2f2');
            $('.1y').css('border-color', '#f2f2f2');
        } else if(time == 366) {
            $('.1y').css('border-color', '#ffc656');

            $('.3m').css('border-color', '#f2f2f2');
            $('.6m').css('border-color', '#f2f2f2');
            $('.1m').css('border-color', '#f2f2f2');
        }
    });

    socket.on('add stocks to side menu', function(arr) {
        //retrieves array from storage in server.js file.
        //pushes the array into currentStock
        if(Array.isArray(arr)) {
            arr.filter(function(x) {
                currentStock.push(x)
            });
            socket.emit('store stock list', currentStock);
        } else {
            //Shitty fix for side-menu socket.io sync bug.
            if(currentStock[currentStock.length-1] == arr) {
                currentStock.pop();
            }
            currentStock.push(arr);
        }
        ReactDOM.render( <SideBarList bankOfStocks={currentStock}/>, document.getElementById('sidebar'));
        ReactDOM.render( <SideBarList bankOfStocks={currentStock}/>, document.getElementById('sidebar2'));
    });

    socket.on('delete a stock from side-menu', function(arr) {
        $('.list-item').remove();
        seriesOptions = [];
        currentStock = arr;
        ReactDOM.render( <SideBarList bankOfStocks={currentStock}/>, document.getElementById('sidebar'));
        ReactDOM.render( <SideBarList bankOfStocks={currentStock}/>, document.getElementById('sidebar2'));
        socket.emit('render chart', arr, timeFrame);
    })

    var chart = {};

    function renderChart(seriesCollection) {
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
            series: seriesCollection,
            exporting: { enabled: false },
            credits: { enabled:false }
        });
    }


    
    $('#addStock').click(function(e) {
        e.preventDefault();
        var userInput = $('form').serializeArray()[0].value.toUpperCase().replace(/\s/g, '');

        $.ajax({
            type: 'GET',
            url: 'https://www.quandl.com/api/v3/datasets/WIKI/'+userInput+'.json?api_key=V4BCHbABAxxzqfHo-miH&start_date=2013-01-01&end_date=2016-03-06',
            dataType: 'json',
            contentType: 'text/plain',
            xhrFields: {
                    withCredentials: false
            },
            success: function(data) {
                if(!data) {
                    console.error('Error: ', data.message);
                }
                console.log(data.dataset.data);
                var currentColor = colors[Math.floor((Math.random() * (colors.length-1)) + 0)];
                var currentSeries = [new seriesObject(data.dataset.data.reverse(), userInput, currentColor)];
                console.log(currentSeries);
                renderChart(currentSeries);
            },
            error: function(response, txtStatus) {
                console.log(response, txtStatus);
            }
        });

        var acceptUserInput = function() {
            //Filter for form submission to prevent invalid 
            //stock symbols or pre-existing symbols within the list.
            if(currentStock.indexOf(userInput) == -1) {
                //pushes the value of from submission to the currentStock array.
                currentStock.push(userInput);
                //added the form submission to the socket function "store stock list"
                socket.emit('store stock list', userInput);
                seriesOptions = [];

                //takes the array of submmited stocks and passes it through 'render chart'
                socket.emit('render chart', currentStock, timeFrame);
                $('#invalid').css('visibility', 'hidden');
            } else {
                $('#invalid').html(userInput + " has already been added.")
                $('#invalid').css('visibility', 'visible');
            }

            document.getElementById('stockname').value = '';
            //Render React to the DOM whenever a new symbol is submitted.
        }   
    });

    $('#clearChart').click(function() {
        socket.emit('clear');
    });

    $('.1m').click(function() {
        if(currentStock.length > 0){
            timeFrame = 30;
            socket.emit('render chart', currentStock, timeFrame);
            $('.1m').css('border-color', '#ffc656');

            $('.3m').css('border-color', '#f2f2f2');
            $('.6m').css('border-color', '#f2f2f2');
            $('.1y').css('border-color', '#f2f2f2');
        }
    });

    $('.3m').click(function() {
        if(currentStock.length > 0){
            timeFrame = 90;
            socket.emit('render chart', currentStock, timeFrame);
            $('.3m').css('border-color', '#ffc656');

            $('.1m').css('border-color', '#f2f2f2');
            $('.6m').css('border-color', '#f2f2f2');
            $('.1y').css('border-color', '#f2f2f2');
        }
    });

    $('.6m').click(function() {
        if(currentStock.length > 0){
            timeFrame = 183;
            socket.emit('render chart', currentStock, timeFrame);
            $('.6m').css('border-color', '#ffc656');

            $('.3m').css('border-color', '#f2f2f2');
            $('.1m').css('border-color', '#f2f2f2');
            $('.1y').css('border-color', '#f2f2f2');
        }
    });

    $('.1y').click(function() {
        if(currentStock.length > 0){
            timeFrame = 366;
            socket.emit('render chart', currentStock, timeFrame);
            $('.1y').css('border-color', '#ffc656');

            $('.3m').css('border-color', '#f2f2f2');
            $('.6m').css('border-color', '#f2f2f2');
            $('.1m').css('border-color', '#f2f2f2');
        }
    });

    socket.on('clear', function() {
        currentStock = [];
        socket.emit('empty list');
        if(chart.series) {
            chart.series.filter(function(data) {
                data.setData([]);
            });
        }
        $('.list-item').remove();
        $('#chartContainer').empty();
        ReactDOM.render( <SideBarList bankOfStocks={currentStock}/>, document.getElementById('sidebar'));
        ReactDOM.render( <SideBarList bankOfStocks={currentStock}/>, document.getElementById('sidebar2'));
    })

    //Define React SideBarList Class
    var SideBarList = React.createClass({
        getInitialState: function() {
            return {
                stockList: { stockTick: [{symbol: this.props.bankOfStocks}]}
            }
        },

        deleteItem: function(i) {
            var x = this.state.stockList.stockTick[0].symbol[i];
            currentStock.splice(currentStock.indexOf(x), 1);
            if(currentStock.length == 0) {
                socket.emit('clear');
            } else {
                this.setState({stockList: { stockTick: [{symbol: this.props.bankOfStocks}]}});
                seriesOptions = [];
                socket.emit('delete stock item', x);
            }
        },

        render: function() {
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
});

