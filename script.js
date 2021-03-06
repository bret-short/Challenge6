
//declare a variable to store the searched city
var city="";
//variable declarations
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty= $("#humidity");
var currentWSpeed=$("#wind-speed");
var currentUvindex= $("#uv-index");
var sCity=[];
// searches the city to see if it exists in the entries from local storage
function find(c){
    for (var i = 0; i < sCity.length; i++){
        if(c === sCity[i]){
            return -1;
        }
    }
    return 1;
}
//set up the API key
var APIKey="a0aca8a89948154a4182dcecc780b513";
//display the curent and future weather
function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}
//create the AJAX call
function currentWeather(city){
    //create the url where the data will be pulled
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

        //parse the response to display the current weather including city, date and icon 
        console.log(response);
        //data object from server side Api for icon property.
        var weathericon = response.weather[0].icon;
        var iconurl = "https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        var date=new Date(response.dt*1000).toLocaleDateString();
        //parse the response for name of city and concatenate the date and icon.
        $(currentCity).html(response.name + " ("+date+")" + "<img src="+iconurl+">");
        
        //convert to fahrenheit

        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempF).toFixed(2) + " &#8457");
        //display the Humidity
        $(currentHumidty).html(response.main.humidity + "%");
        //display Wind speed and convert to MPH
        var ws = response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(currentWSpeed).html(windsmph+"MPH");
        //display UVIndex.
        //use geographic coordinates method build the uv query url inside the function below.
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod == 200){
            sCity = JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity == null){
                sCity = [];
                sCity.push(city);
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addToList(city);
                
            }
            else {
                if(find(city) > 0){
                    sCity.push(city);
                    localStorage.setItem("cityname",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}
    //this function returns the UVIindex response.
function UVIndex(ln,lt){
    //where to get the uv index
    var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;
        $.ajax({
            url:uvURL,
            method: "GET"
            }).then(function(response) {
                $(currentUvindex).html(response.value);
                var currentuv = response.value;
                var bgcolor;
                if (currentuv <= 2) {
                    bgcolor = "green";
                }
                else if (currentuv >= 2 || currentuv <= 5) {
                    bgcolor = "yellow";
                }
                else if (currentuv >= 5 || currentuv <= 8) {
                    bgcolor = "orange";
                }
                else {
                    bgcolor = "red";
                }
                
            });

            
        };

    
    //display the 5 days forecast for the current city.
    function forecast(cityid){
    var dayover = false;
    var queryforcastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey;
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){
        
        for (i = 0;i < 5;i ++){
            var date = new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode = response.list[((i+1)*8)-1].weather[0].icon;
            var iconurl ="https://openweathermap.org/img/wn/"+iconcode+".png";
            var tempK = response.list[((i+1)*8)-1].main.temp;
            var tempF =(((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity = response.list[((i+1)*8)-1].main.humidity;
        
            $("#fDate" + i).html(date);
            $("#fImg" + i).html("<img src="+iconurl+">");
            $("#fTemp" + i).html(tempF+"&#8457");
            $("#fHumidity" + i).html(humidity+"%");
        }
        
    });
}

//dynamically add the passed city on the search history
function addToList(c){
    var listEl= $("<li>"+c+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c);
    $(".list-group").append(listEl);
}
//display the past search again when the list group item is clicked in search history
function invokePastSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}

//render function
function loadlastCity(){
    $("ul").empty();
    var sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }

}
//clear the search history from the page
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}
//click Handlers
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$("#clear-history").on("click",clearHistory);





















