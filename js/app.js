$(function () {
    console.log("Hey, don't look in here...")
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
    
    //Button that toggles the side menu on and off.
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        $(".list-btn").html($('.list-btn').text() == 'Hide stock list' ? 'Show stock list' : 'Hide stock list');
    });

    var chart = {};

    socket.on('render chart', function(stocks, time) {
        var excludeDuplicates = [];
        stocks.filter(function(stock) {
            if(excludeDuplicates.indexOf(stock) == -1) {
                excludeDuplicates.push(stock);
            }
        });

        excludeDuplicates.filter(function(stock) {
            quandlCall(stock, time);
        });
        //checks to see which time frame is activated on the chart.
        //Changes the activated one to have an orange outline.
        if(time == 31) {
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

    //function to convert duration number from timeframe buttons to a valid
    //date format to pass into the Ajax call.
    function convertTimeToDate(time) {
        var d = new Date();
        var d2 = new Date();
        d2.setDate(d2.getDate());
        d.setDate(d.getDate()-time);
        var startDate = d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
        var endDate = d2.getFullYear() + '-' + (d2.getMonth()+1) + '-' + d2.getDate();
        return([startDate, endDate]);
    }

    //Make an Ajax call to the Quandl API.
    function quandlCall(input, timeFrame) {
        var x = convertTimeToDate(timeFrame);

        //Function that adds a '0' to dates with single digit numbers
        //in order to pass URL formatting requirements.
        function correct(x) {
            var month = x.split('-')[1];
            var day = x.split('-')[2]; 
            var result = [x.split('-')[0]];
            
            //if month only has one digit i.e "2" instead of "02",
            //add a "0" in front of the digit.
            if(month.length < 2) {
                result.push('0' + month)
            } else {
                result.push(month);
            }
            //day will always be the first of the month.
            result.push('01');
            return(result.join('-'))
        }

        var startDate = correct(x[0])
        var endDate = correct(x[1])

        seriesOptions = [];
        $.ajax({
            type: 'GET',
            url: 'https://www.quandl.com/api/v3/datasets/WIKI/'+input+'.json?api_key=V4BCHbABAxxzqfHo-miH&start_date='
                  +startDate+'&end_date='+endDate,
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
        Highcharts.dateFormat("Year: %Y Month: %m Day: %d", 20, false);
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
                    format: '{value: %Y/%m/%d}',
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


    //Change border color when a timeFrame button is clicked and set
    //timeFrame variable according to each button.
    $('.1m').click(function() {
        if(currentStock.length > 0){
            timeFrame = 31;
            socket.emit('store time', timeFrame);
            $('.1m').css('border-color', '#ffc656');

            $('.3m').css('border-color', '#f2f2f2');
            $('.6m').css('border-color', '#f2f2f2');
            $('.1y').css('border-color', '#f2f2f2');
        }
    });

    $('.3m').click(function() {
        if(currentStock.length > 0){
            timeFrame = 90;
            socket.emit('store time', timeFrame);
            $('.3m').css('border-color', '#ffc656');

            $('.1m').css('border-color', '#f2f2f2');
            $('.6m').css('border-color', '#f2f2f2');
            $('.1y').css('border-color', '#f2f2f2');
        }
    });

    $('.6m').click(function() {
        if(currentStock.length > 0){
            timeFrame = 183;
            socket.emit('store time', timeFrame);
            $('.6m').css('border-color', '#ffc656');

            $('.3m').css('border-color', '#f2f2f2');
            $('.1m').css('border-color', '#f2f2f2');
            $('.1y').css('border-color', '#f2f2f2');
        }
    });

    $('.1y').click(function() {
        if(currentStock.length > 0){
            timeFrame = 366;
            socket.emit('store time', timeFrame);
            $('.1y').css('border-color', '#ffc656');

            $('.3m').css('border-color', '#f2f2f2');
            $('.6m').css('border-color', '#f2f2f2');
            $('.1m').css('border-color', '#f2f2f2');
        }
    });

});

