//forcast api = "https://api.forecast.io/forecast/APIKEY/LATITUDE,LONGITUDE"
//geolocator api = "https://www.googleapis.com/geolocation/v1/geolocate?key="
//
var APIKEY = "ad05a86902b581dcb64cbfacef513319"
var BASE_URL = "https://api.forecast.io/forecast/"

//var geolocatorApiKey = "AIzaSyBvkVytYncPHjeEXjwN_mHRtBQtQRkULfk"
//var geolocatorBaseUrl = "https://www.googleapis.com/geolocation/v1/geolocate?key="



var weatherContainerNode = document.querySelector("#weatherAppContainer")
var buttonContainerNode = document.querySelector("#nav-buttons") 
var dailyWeatherNode = document.querySelector("#dailyWeatherContainer")
var hourlyWeatherNode = document.querySelector("#hourlyWeatherContainer")

var renderCurrentView = function (weatherApiResponse) {
	console.log('current view being called')
	var weatherObj = weatherApiResponse
	console.log(weatherObj)
	var htmlString = " "
	var temperature = weatherObj.currently.temperature,
		icon = weatherObj.currently.icon,
		apparentTemp = weatherObj.currently.apparentTemperature

	var degreeSymbol = "°"
	degreeSymbol = degreeSymbol.substr(1)

	htmlString += "<h3>" + "FORCAST NOW" + "</h3>"
	htmlString += "<div class = 'forcastCards'>"
	htmlString += "<p class = 'temp'>" + parseInt(temperature) + degreeSymbol +  "</p>"
	htmlString += "<p>" + "FEELS LIKE " + parseInt(apparentTemp) + degreeSymbol + "</p>"
	htmlString += "<p>" + icon + "</p>"
	htmlString += "</div>"



	var currentWeatherContainer = document.querySelector("#weatherAppContainer")
	currentWeatherContainer.innerHTML = htmlString
}



var renderDailyView  = function (weatherApiResponse) {

	var weatherObj = weatherApiResponse
	var dailyWeatherArray = weatherObj.daily.data

	htmlString = "<h3>" + "FORCAST DAILY" + "</h3>"
	for(var i = 0; i < dailyWeatherArray.length; i++) {
		var dailyWeatherObj = dailyWeatherArray[i]

		var degreeSymbol = "°"
		degreeSymbol = degreeSymbol.substr(1)

		var toDateTimeSecs = function(secs) {
		var t = new Date(1970, 0, 1); // Epoch
		t.setSeconds(secs);
		return t;
		}

		toDateTimeSecs(dailyWeatherObj.time)

		var weekdayNumber = toDateTimeSecs(dailyWeatherObj.time).getDay(),
			dayOfTheMonthNumber = toDateTimeSecs(dailyWeatherObj.time).getDate(),
			summary = dailyWeatherObj.summary,
			dayOfTheWeek = {
			
		    0: "Sun", 
		    1: "Mon",
		    2: "Tues",
		    3: "Wed",
		    4: "Thur",
		    5: "Fri",
		    6: "Sat"
		    
			}

		var	getDayOfTheWeek = function (numberOfDay) {
			return dayOfTheWeek[numberOfDay]
		}

		var weatherDateString = getDayOfTheWeek(weekdayNumber) + " " + dayOfTheMonthNumber

		htmlString += "<div class = 'forcastCards'>"		
		htmlString += "<p id = 'time'>" + weatherDateString + "</p>"
		htmlString += "<p class = 'temp'>" + parseInt(dailyWeatherObj.temperatureMax) + degreeSymbol + "</p>"
		htmlString += "<p>" + summary + "</p>"
		htmlString += "</div>"
		
	


		var dailyWeatherContainer = document.querySelector("#weatherAppContainer")
		dailyWeatherContainer.innerHTML = htmlString
	}

}



var renderHourlyView = function (weatherApiResponse) {
	console.log(weatherApiResponse)
	var weatherObj = weatherApiResponse
	console.log(weatherObj)
	var hourlyWeatherArray = weatherObj.hourly.data
	//console.log(hourlyWeatherArray)

	
		htmlString = "<h3>" + "HOURLY FORCAST TOMORROW" + "</h3>" 	
		for(var i = 0; i < hourlyWeatherArray.length; i++) {
		var hourlyWeatherObj = hourlyWeatherArray[i]

		var degreeSymbol = "°"
		degreeSymbol = degreeSymbol.substr(1)

		
		var toDateTimeSecs = function(secs) {
	    var t = new Date(1970, 0, 1); // Epoch
	    t.setSeconds(secs);
	    return t;
		}

		var summary = hourlyWeatherObj.summary
		var getHours = toDateTimeSecs(hourlyWeatherObj.time).getHours()
		var militaryHr = getHours.toString(10)

		var standardHr = function (twoDigitTime) {
	    var hours24 = parseInt(twoDigitTime.substring(0, 2),10);
	    var hours = ((hours24 + 11) % 12) + 1;
	    var amPm = hours24 > 11 ? 'pm' : 'am';
  

	    return hours + amPm;
		};

		htmlString += "<div class = 'forcastCards'>"
		htmlString += "<p id = 'hourTime'>" + standardHr(militaryHr) + "</p>"
		htmlString += "<p class = 'temp'>" + parseInt(hourlyWeatherObj.temperature) + degreeSymbol + "</p>"
		htmlString += "<p>" + summary + "</p>"
		htmlString += "</div>"


		var hourlyWeatherContainer = document.querySelector("#weatherAppContainer")
		hourlyWeatherContainer.innerHTML = htmlString
		
	}

}

var hashChange = function(eventObj) {

		var viewType = eventObj.target.value
		location.hash = lat + "/" + lng + "/" + viewType

}

buttonContainerNode.addEventListener('click', hashChange)


var errorHandler = function(error) {
	console.log(error)
}


var defaultLocation = function(geoPosResponse) { 
		
		var lat = geoPosResponse.coords.latitude
		var lng = geoPosResponse.coords.longitude
		location.hash = lat + "/" + lng + "/" + "current"

}




var doWeatherRequest = function (lat, lng) {
	//https://api.forecast.io/forecast/
	//console.log(lat,lng)

	var weatherFullUrl = BASE_URL + APIKEY + "/" + lat + "," + lng 
	weatherFullUrl.substr(1)
	var weatherPromise = $.getJSON(weatherFullUrl)
	// weatherPromise.then(function (data) {console.log(data) })
	return weatherPromise
}





var WeatherRouter = Backbone.Router.extend ({

	routes: {
		
		":lat/:lng/current": "showCurrentView",
		":lat/:lng/daily": "showDailyView",
		":lat/:lng/hourly": "showHourlyView",
		"*default": "geolocate"

	},




	geolocate: function () {
		//get the current latitude and longitude of the computer
		navigator.geolocation.getCurrentPosition(defaultLocation, errorHandler)
		//write them to the hash, appending "current" as the default view
		
		//location.hash = "25/95/current"
	},



	showCurrentView: function (lat, lng) {

		// make a request for forecast data at the input lat and lng
		// 
		// queues up renderCurrentView to run when the request is fulfilled

		var promise = doWeatherRequest(lat, lng)
		promise.then(renderCurrentView)
		

		// 
		// doWeatherRequest(lat,lng)//>>>>do .then request

	},

	showDailyView: function (lat, lng) {

		var promise = doWeatherRequest(lat, lng)
		promise.then(renderDailyView)

	},

	showHourlyView: function (lat, lng) {
		
		var promise = doWeatherRequest(lat, lng)
		promise.then(renderHourlyView)

	}

})

// create a new instance of the router
var rtr = new WeatherRouter()

// tell backbone to start watching the hash and tracking browser history
Backbone.history.start()

/*
var controller = function () {
	
	if (!location.hash) {

		navigator.geolocation.getCurrentPosition(defaultLocation, errorHandler)
		return
	
	}

	var hashObj = getHashData()
	

	var weatherPromise = $.getJSON(BASE_URL + APIKEY + "/" + hashObj.lat + "," + hashObj.lng)

	if (hashObj.viewType === "current") {
		
		weatherPromise.then(renderCurrentView)
	
	} else if (hashObj.viewType === "daily") {
			
		weatherPromise.then(renderDailyView)

	} else if (hashObj.viewType === "hourly") {
			
		weatherPromise.then(renderHourlyView)
	}	
	

}


controller() //>>> why did you have to call the controller function

window.addEventListener('hashchange', controller)  


//var searchBar = document.querySelector("input")
*/
//searchBar.addEventListener("keydown", searchFunction)