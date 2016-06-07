
$(function () {
    var Markit = {},
        seriesOptions = [],
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

    function seriesObject(ohlc, volume, symbol, color) {
        this.type = 'spline',
        this.name = symbol, 
        this.data = ohlc,
        this.color = color
    };

    /**
     * Define the InteractiveChartApi.
     * First argument is symbol (string) for the quote. Examples: AAPL, MSFT, JNJ, GOOG.
     * Second argument is duration (int) for how many days of history to retrieve.
     */
    Markit.InteractiveChartApi = function(symbol,duration){
        this.symbol = symbol.toUpperCase();
        this.duration = duration;
        this.PlotChart();
    };

    //Define PlotChart prototype that makes the JSONP call for the stock.
    Markit.InteractiveChartApi.prototype.PlotChart = function(){
        var params = {
            parameters: JSON.stringify( this.getInputParams() )
        }

        //Make JSON request for timeseries data
        $.ajax({
            async: true,
            type: 'GET',
            data: params,
            url: "http://dev.markitondemand.com/Api/v2/InteractiveChart/jsonp",
            dataType: "jsonp",
            context: this,
            success: function(json){
                //Catch errors
                if (!json || json.Message){
                    console.error("Error: ", json.Message);
                    $.ajax(this);
                    return;
                }

                var currentColor = colors[Math.floor((Math.random() * (colors.length-1)) + 0)]
                var currentSeries = new seriesObject(this._getOHLC(json), this._getVolume(json), this.symbol, currentColor);
                seriesOptions.push(currentSeries);
                console.log("symbol: " + this.symbol, "Color: "+ currentColor)
                this.render(seriesOptions);
            },
            error: function(response,txtStatus){
                console.log(response,txtStatus)
            }
        });
    };

    //getInputParams processes the symbol and duration data and 
    //sets it to the corresponding attributes.Then, returns the object for use.
    Markit.InteractiveChartApi.prototype.getInputParams = function(){
        return {  
            Normalized: false,
            NumberOfDays: this.duration,
            DataPeriod: "Day",
            Elements: [
                {
                    Symbol: this.symbol,
                    Type: "price",
                    Params: ["ohlc"] //ohlc, c = close only
                },
                {
                    Symbol: this.symbol,
                    Type: "volume"
                }
            ]
            //,LabelPeriod: 'Week',
            //LabelInterval: 1
        }
    };

    //sets the the correct date format to use in the chart.
    Markit.InteractiveChartApi.prototype._fixDate = function(dateIn) {
        var dat = new Date(dateIn);
        return Date.UTC(dat.getFullYear(), dat.getMonth(), dat.getDate());
    };

    //Returns chartSeries. The data points for the stock.
    Markit.InteractiveChartApi.prototype._getOHLC = function(json) {
        var dates = json.Dates || [];
        var elements = json.Elements || [];
        var chartSeries = [];

        if (elements[0]){

            for (var i = 0, datLen = dates.length; i < datLen; i++) {
                var dat = this._fixDate( dates[i] );
                var pointData = [
                    dat,
                    elements[0].DataSeries['open'].values[i],
                    elements[0].DataSeries['high'].values[i],
                    elements[0].DataSeries['low'].values[i],
                    elements[0].DataSeries['close'].values[i]
                ];
                chartSeries.push( pointData );
            };
        }
        return chartSeries;
    };

    //Returns chartSeries. The value of each point.
    Markit.InteractiveChartApi.prototype._getVolume = function(json) {
        var dates = json.Dates || [];
        var elements = json.Elements || [];
        var chartSeries = [];

        if (elements[1]){

            for (var i = 0, datLen = dates.length; i < datLen; i++) {
                var dat = this._fixDate( dates[i] );
                var pointData = [
                    dat,
                    elements[1].DataSeries['volume'].values[i]
                ];
                chartSeries.push( pointData );
            };
        }
        return chartSeries;
    };
    var chart = {};


    //renders the chart with all the neccesary data produces from other 
    //functions.
    Markit.InteractiveChartApi.prototype.render = function(seriesCollection) {
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
                opposite: true,
            
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
    };

    var newChart;
    var currentStock = [];

    //this is what causes array to be blank in some cases?
    socket.emit('store stock list', currentStock);
//---------------------------------------------------------------------------------------
//  React side-menu and buttons code below.
    
    //Button that toggles the side menu on and off.
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        $(".list-btn").html($('.list-btn').text() == 'Hide stock list' ? 'Show stock list' : 'Hide stock list');
    });

    socket.on('render chart', function(stocks) {
        //seriesOptions = [];
        stocks.filter(function(stock) {
            newChart = new Markit.InteractiveChartApi(stock, 360);
        });
    });

    socket.on('add stocks to side menu', function(arr) {
        //retrieves array from storage in server.js file.
        //pushes the array into currentStock
        //currentStock.push(arr);
        //currentStock = []
        if(Array.isArray(arr)) {
            console.log('array: '+arr)
            arr.filter(function(x) {
                currentStock.push(x)
            });
            socket.emit('store stock list', currentStock);
        } else {
            console.log('not array: '+ arr +'pushed into: '+ currentStock)
            
            //Shitty fix for side-menu socket.io sync bug.
            if(currentStock[currentStock.length-1] == arr) {
                currentStock.pop();
            }
            currentStock.push(arr);
            console.log(currentStock)
        }

        //currentStock = arr;

        ReactDOM.render(
            <SideBarList bankOfStocks={currentStock}/>, document.getElementById('sidebar')
        )
    });
    
    $('#addStock').click(function(e) {
        e.preventDefault();
        //pushes the value of from submission to the currentStock array.
        //currentStock = [];
        currentStock.push($('form').serializeArray()[0].value.toUpperCase());
        console.log("currentStock on form: "+ currentStock)
        //added the form submission to the socket function "store stock list"
        socket.emit('store stock list', $('form').serializeArray()[0].value.toUpperCase());
        seriesOptions = [];

        //takes the array of submmited stocks and passes it through 'render chart'
        socket.emit('render chart', currentStock);

        document.getElementById('stockname').value = '';
        //Render React to the DOM whenever a new symbol is submitted.
    });

    $('#clearChart').click(function() {
        currentStock = [];
        socket.emit('store stock list', []);
        seriesOptions = [];
        chart.series.filter(function(data) {
            data.setData([]);
        });
        $('.list-item').remove();
        $('#chartContainer').empty();
        ReactDOM.render(
            <SideBarList />, document.getElementById('sidebar')
        )
    });

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
            this.setState({stockList: { stockTick: [{symbol: this.props.bankOfStocks}]}});
            seriesOptions = [];
            socket.emit('store stock list', $('form').serializeArray()[0].value.toUpperCase())
            //currentStock.filter(function(stock) {
              //  newChart = new Markit.InteractiveChartApi(stock, 360);
            //});

            if(currentStock.length == 0) {
                $('#chartContainer').empty();
            }
        },

        render: function() {
            console.log('prop.bankOfStocks: '+ this.props.bankOfStocks)
            console.log('this.state.stockList: '+this.state.stockList.stockTick[0].symbol);
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

